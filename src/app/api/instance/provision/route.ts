import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import { tenants } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { createApp, allocateIpAddresses, createVolume, createMachine, destroyApp } from "@/lib/fly";
import crypto from "crypto";

// Async provisioning: create Fly resources and return immediately.
// The status route polls Fly and auto-promotes to "active" when ready.
// This avoids Vercel function timeout (10s Hobby, 60s Pro) killing long provisions.

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
  const region = "iad";

  // Mark as provisioning immediately
  await db
    .update(tenants)
    .set({
      status: "provisioning",
      flyAppName: appName,
      flyRegion: region,
      gatewayToken,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenant.id));

  // Provision Fly.io instance — create resources then return immediately
  try {
    await createApp(appName);
    await allocateIpAddresses(appName);
    const volumeId = await createVolume(appName, region);

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

    const { machineId, instanceUrl } = await createMachine(
      appName,
      tenant.plan,
      volumeId,
      envVars,
      gatewayToken,
      region
    );

    // Persist machine details — status route will poll and promote to "active"
    await db
      .update(tenants)
      .set({
        flyMachineId: machineId,
        instanceUrl,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenant.id));

    return NextResponse.json({ status: "provisioning", instanceUrl });
  } catch (err) {
    console.error(`Provisioning failed for ${appName}:`, err);
    // Clean up orphaned Fly app so retries start fresh
    try {
      await destroyApp(appName);
    } catch {
      // App may not exist yet if failure was early
    }
    // Revert to paid and clear fly fields so user can retry cleanly
    await db
      .update(tenants)
      .set({
        status: "paid",
        flyAppName: null,
        flyMachineId: null,
        instanceUrl: null,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenant.id));
    const errMsg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Provisioning failed: ${errMsg}` }, { status: 500 });
  }
}
