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
  } catch (err) {
    // If Fly returns 404, the app/machine was deleted externally — reset tenant
    const errMsg = err instanceof Error ? err.message : "";
    if (errMsg.includes("404")) {
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

      return NextResponse.json({
        tenantStatus: "paid",
        machineState: null,
        plan: tenant.plan,
      });
    }

    return NextResponse.json({
      tenantStatus: tenant.status,
      machineState: "unknown",
      instanceUrl: tenant.instanceUrl,
      gatewayToken: tenant.gatewayToken,
      plan: tenant.plan,
    });
  }
}
