import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import { tenants } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { createApp, allocateIpAddresses, createVolume, deleteVolume, createMachine, destroyApp } from "@/lib/fly";
import crypto from "crypto";

// Async provisioning: create Fly resources and return immediately.
// The status route polls Fly and auto-promotes to "active" when ready.
// This avoids Vercel function timeout (10s Hobby, 60s Pro) killing long provisions.

// Region fallback: try multiple regions in case one is out of capacity (409/412).
const REGIONS = ["iad", "ord", "ewr", "sjc"];

function isCapacityError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : "";
  return msg.includes("409") || msg.includes("412") || msg.includes("insufficient");
}

export async function POST() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.userId, user.id),
  });

  if (!tenant) {
    return NextResponse.json({ error: "No tenant found" }, { status: 404 });
  }

  if (tenant.status !== "paid") {
    return NextResponse.json(
      { error: "Instance already provisioned or not eligible" },
      { status: 400 }
    );
  }

  const appName = `oc-${crypto.randomBytes(6).toString("hex")}`;
  const gatewayToken = crypto.randomBytes(32).toString("hex");

  // Mark as provisioning immediately
  await db
    .update(tenants)
    .set({
      status: "provisioning",
      flyAppName: appName,
      gatewayToken,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenant.id));

  // Build env vars for the machine
  const envVars: Record<string, string> = {
    HOME: "/home/node",
    NODE_OPTIONS: "--max-old-space-size=1536",
    OPENCLAW_GATEWAY_TOKEN: gatewayToken,
  };
  const envVal = (key: string) => (process.env[key] || "").trim();
  if (envVal("OPENCLAW_DEFAULT_ANTHROPIC_KEY")) {
    envVars.ANTHROPIC_API_KEY = envVal("OPENCLAW_DEFAULT_ANTHROPIC_KEY");
  }
  if (envVal("OPENCLAW_DEFAULT_OPENAI_KEY")) {
    envVars.OPENAI_API_KEY = envVal("OPENCLAW_DEFAULT_OPENAI_KEY");
  }
  if (envVal("OPENCLAW_DEFAULT_OPENROUTER_KEY")) {
    envVars.OPENROUTER_API_KEY = envVal("OPENCLAW_DEFAULT_OPENROUTER_KEY");
  }
  // Default model is configured in openclaw.json (agents.defaults.model), not env vars
  // Telegram token passed as env var — OpenClaw reads it natively, keeps its UI default
  if (tenant.telegramBotToken) {
    envVars.TELEGRAM_BOT_TOKEN = tenant.telegramBotToken;
  }

  try {
    // App + IPs are region-agnostic — create once
    await createApp(appName);
    await allocateIpAddresses(appName);

    // Try volume + machine across regions until one succeeds
    let lastErr: unknown;
    for (const region of REGIONS) {
      let volumeId: string | null = null;
      try {
        volumeId = await createVolume(appName, region);
        const { machineId, instanceUrl } = await createMachine(
          appName,
          tenant.plan,
          volumeId,
          envVars,
          gatewayToken,
          region
        );

        // Success — persist and return
        await db
          .update(tenants)
          .set({
            flyMachineId: machineId,
            flyRegion: region,
            instanceUrl,
            updatedAt: new Date(),
          })
          .where(eq(tenants.id, tenant.id));

        return NextResponse.json({ status: "provisioning", instanceUrl });
      } catch (err) {
        lastErr = err;
        console.error(`Provision failed in ${region}:`, err);
        // Clean up the volume from this failed attempt
        if (volumeId) {
          try { await deleteVolume(appName, volumeId); } catch { /* best effort */ }
        }
        // Only retry on capacity errors — other errors are not region-specific
        if (!isCapacityError(err)) break;
      }
    }

    // All regions failed — throw to trigger cleanup
    throw lastErr || new Error("All regions exhausted");
  } catch (err) {
    console.error(`Provisioning failed for ${appName}:`, err);
    try { await destroyApp(appName); } catch { /* App may not exist */ }
    await db
      .update(tenants)
      .set({
        status: "paid",
        flyAppName: null,
        flyMachineId: null,
        flyRegion: null,
        instanceUrl: null,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenant.id));
    const errMsg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Provisioning failed: ${errMsg}` }, { status: 500 });
  }
}
