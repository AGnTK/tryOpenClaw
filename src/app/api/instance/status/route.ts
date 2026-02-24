import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import { tenants } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getMachineStatus } from "@/lib/fly";

export async function GET() {
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

  if (!tenant.flyAppName || !tenant.flyMachineId) {
    return NextResponse.json({
      tenantStatus: tenant.status,
      machineState: null,
      plan: tenant.plan,
    });
  }

  try {
    const machine = await getMachineStatus(tenant.flyAppName, tenant.flyMachineId);
    return NextResponse.json({
      tenantStatus: tenant.status,
      machineState: machine.state,
      instanceUrl: tenant.instanceUrl,
      gatewayToken: tenant.gatewayToken,
      plan: tenant.plan,
      region: tenant.flyRegion,
    });
  } catch {
    return NextResponse.json({
      tenantStatus: tenant.status,
      machineState: "unknown",
      instanceUrl: tenant.instanceUrl,
      gatewayToken: tenant.gatewayToken,
      plan: tenant.plan,
    });
  }
}
