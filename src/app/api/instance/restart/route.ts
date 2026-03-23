import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import { tenants } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { stopMachine, startMachine } from "@/lib/fly";

export async function POST() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.userId, user.id),
    orderBy: [desc(tenants.updatedAt)],
  });

  if (!tenant || !tenant.flyAppName || !tenant.flyMachineId) {
    return NextResponse.json({ error: "No instance found" }, { status: 404 });
  }

  if (tenant.status !== "active") {
    return NextResponse.json({ error: "Instance not active" }, { status: 400 });
  }

  try {
    await stopMachine(tenant.flyAppName, tenant.flyMachineId);
    // Brief pause before restart
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await startMachine(tenant.flyAppName, tenant.flyMachineId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Restart failed:", err);
    return NextResponse.json({ error: "Restart failed" }, { status: 500 });
  }
}
