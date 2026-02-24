import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import { tenants } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { createApp, createVolume, createMachine } from "@/lib/fly";
import crypto from "crypto";

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

  // Provision Fly.io instance
  try {
    await createApp(appName);
    const volumeId = await createVolume(appName, region);

    const envVars: Record<string, string> = {
      OPENCLAW_GATEWAY_TOKEN: gatewayToken,
      OPENCLAW_STATE_DIR: "/root/.openclaw",
    };
    if (process.env.OPENCLAW_DEFAULT_ANTHROPIC_KEY) {
      envVars.ANTHROPIC_API_KEY = process.env.OPENCLAW_DEFAULT_ANTHROPIC_KEY;
    }
    if (process.env.OPENCLAW_DEFAULT_OPENAI_KEY) {
      envVars.OPENAI_API_KEY = process.env.OPENCLAW_DEFAULT_OPENAI_KEY;
    }

    const { machineId, instanceUrl } = await createMachine(
      appName,
      tenant.plan,
      volumeId,
      envVars,
      region
    );

    await db
      .update(tenants)
      .set({
        flyMachineId: machineId,
        instanceUrl,
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenant.id));

    return NextResponse.json({ status: "active", instanceUrl });
  } catch (err) {
    console.error(`Provisioning failed for ${appName}:`, err);
    // Revert to paid so user can retry
    await db
      .update(tenants)
      .set({ status: "paid", updatedAt: new Date() })
      .where(eq(tenants.id, tenant.id));
    return NextResponse.json({ error: "Provisioning failed" }, { status: 500 });
  }
}
