import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import { tenants } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { buildOpenClawConfigJson, ensureMachineTelegramWebhookService, updateMachineEnvVars } from "@/lib/fly";

async function getTenantForUser() {
  const user = await getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.userId, user.id),
    orderBy: [desc(tenants.updatedAt)],
  });
  if (!tenant) return { error: NextResponse.json({ error: "No tenant found" }, { status: 404 }) };

  return { tenant };
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

  // If machine exists, set TELEGRAM_BOT_TOKEN env var (Fly POST restarts the machine).
  // OpenClaw reads this env var natively and configures Telegram provider on boot.
  if (tenant.flyAppName && tenant.flyMachineId && (tenant.status === "active" || tenant.status === "stopped")) {
    try {
      await ensureMachineTelegramWebhookService(tenant.flyAppName, tenant.flyMachineId);
      const envUpdates: Record<string, string | null> = {
        TELEGRAM_BOT_TOKEN: botToken,
      };
      if (tenant.gatewayToken) {
        envUpdates.OPENCLAW_CONFIG_JSON = buildOpenClawConfigJson(tenant.flyAppName, tenant.gatewayToken);
      }
      await updateMachineEnvVars(tenant.flyAppName, tenant.flyMachineId, {
        ...envUpdates,
      });
    } catch (err) {
      console.error("Failed to update machine env for Telegram:", err);
      return NextResponse.json({
        success: true,
        botUsername,
        warning: "Token saved but machine update failed. Try restarting your instance.",
      });
    }
  }

  return NextResponse.json({ success: true, botUsername });
}

export async function DELETE() {
  const result = await getTenantForUser();
  if ("error" in result) return result.error;
  const { tenant } = result;

  // Best-effort cleanup of Telegram webhook while we still have the token.
  if (tenant.telegramBotToken) {
    try {
      await fetch(`https://api.telegram.org/bot${tenant.telegramBotToken}/deleteWebhook`, {
        method: "POST",
      });
    } catch (err) {
      console.error("Failed to delete Telegram webhook:", err);
    }
  }

  // Clear token from DB
  await db
    .update(tenants)
    .set({ telegramBotToken: null, updatedAt: new Date() })
    .where(eq(tenants.id, tenant.id));

  // If machine exists, remove TELEGRAM_BOT_TOKEN env var (Fly POST restarts the machine).
  if (tenant.flyAppName && tenant.flyMachineId && (tenant.status === "active" || tenant.status === "stopped")) {
    try {
      await updateMachineEnvVars(tenant.flyAppName, tenant.flyMachineId, {
        TELEGRAM_BOT_TOKEN: null,
      });
    } catch (err) {
      console.error("Failed to remove Telegram env var:", err);
    }
  }

  return NextResponse.json({ success: true });
}
