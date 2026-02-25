import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import { tenants } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { updateMachineOpenClawConfig, stopMachine, startMachine } from "@/lib/fly";

async function getTenantForUser() {
  const user = await getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.userId, user.id),
  });
  if (!tenant) return { error: NextResponse.json({ error: "No tenant found" }, { status: 404 }) };

  return { tenant };
}

async function restartMachine(appName: string, machineId: string) {
  await stopMachine(appName, machineId);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  await startMachine(appName, machineId);
}

export async function GET() {
  const result = await getTenantForUser();
  if ("error" in result) return result.error;
  const { tenant } = result;

  if (!tenant.telegramBotToken) {
    return NextResponse.json({ configured: false });
  }

  // Validate token still works by calling getMe
  try {
    const res = await fetch(`https://api.telegram.org/bot${tenant.telegramBotToken}/getMe`);
    const data = await res.json();
    if (data.ok) {
      return NextResponse.json({
        configured: true,
        botUsername: data.result.username,
      });
    }
  } catch {
    // Token exists but can't verify — still show as configured
  }

  return NextResponse.json({ configured: true });
}

export async function POST(request: Request) {
  const result = await getTenantForUser();
  if ("error" in result) return result.error;
  const { tenant } = result;

  const body = await request.json();
  const botToken = (body.botToken || "").trim();

  if (!botToken) {
    return NextResponse.json({ error: "Bot token is required" }, { status: 400 });
  }

  // Validate the token with Telegram
  let botUsername: string;
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const data = await res.json();
    if (!data.ok) {
      return NextResponse.json({ error: "Invalid bot token" }, { status: 400 });
    }
    botUsername = data.result.username;
  } catch {
    return NextResponse.json({ error: "Failed to verify bot token with Telegram" }, { status: 502 });
  }

  // Save token to DB
  await db
    .update(tenants)
    .set({ telegramBotToken: botToken, updatedAt: new Date() })
    .where(eq(tenants.id, tenant.id));

  // If machine exists, update config and restart
  if (tenant.flyAppName && tenant.flyMachineId && (tenant.status === "active" || tenant.status === "stopped")) {
    try {
      await updateMachineOpenClawConfig(tenant.flyAppName, tenant.flyMachineId, {
        channels: {
          telegram: { enabled: true, botToken, dmPolicy: "open" },
        },
      });

      if (tenant.status === "active") {
        await restartMachine(tenant.flyAppName, tenant.flyMachineId);
      }
    } catch (err) {
      console.error("Failed to update machine config for Telegram:", err);
      // Token is saved, but machine update failed — user can retry
      return NextResponse.json({
        success: true,
        botUsername,
        warning: "Token saved but machine config update failed. Try restarting your instance.",
      });
    }
  }

  return NextResponse.json({ success: true, botUsername });
}

export async function DELETE() {
  const result = await getTenantForUser();
  if ("error" in result) return result.error;
  const { tenant } = result;

  // Clear token from DB
  await db
    .update(tenants)
    .set({ telegramBotToken: null, updatedAt: new Date() })
    .where(eq(tenants.id, tenant.id));

  // If machine exists, remove telegram channel config and restart
  if (tenant.flyAppName && tenant.flyMachineId && (tenant.status === "active" || tenant.status === "stopped")) {
    try {
      await updateMachineOpenClawConfig(tenant.flyAppName, tenant.flyMachineId, {
        channels: {
          telegram: { enabled: false },
        },
      });

      if (tenant.status === "active") {
        await restartMachine(tenant.flyAppName, tenant.flyMachineId);
      }
    } catch (err) {
      console.error("Failed to update machine config for Telegram removal:", err);
    }
  }

  return NextResponse.json({ success: true });
}
