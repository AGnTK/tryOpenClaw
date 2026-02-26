import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import { tenants } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { getMachineStatus } from "@/lib/fly";

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Order by updatedAt desc so the active/latest tenant wins if duplicates exist
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.userId, user.id),
    orderBy: [desc(tenants.updatedAt)],
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

    // Auto-promote: if tenant is "provisioning" and machine is started,
    // check if the HTTP service is reachable, then mark "active".
    // This handles async provisioning — the provision route returns immediately
    // and this status poll completes the transition.
    let tenantStatus = tenant.status;
    if (tenant.status === "provisioning" && machine.state === "started" && tenant.instanceUrl) {
      try {
        const probe = await fetch(tenant.instanceUrl, { signal: AbortSignal.timeout(5000) });
        if (probe.status < 500) {
          await db
            .update(tenants)
            .set({ status: "active", updatedAt: new Date() })
            .where(eq(tenants.id, tenant.id));
          tenantStatus = "active";
        }
      } catch {
        // Service not ready yet — stay in "provisioning", client keeps polling
      }
    }

    return NextResponse.json({
      tenantStatus,
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
