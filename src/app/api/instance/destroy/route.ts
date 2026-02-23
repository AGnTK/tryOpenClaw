import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import { tenants } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { destroyMachine, destroyApp } from "@/lib/fly";

export async function POST() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.userId, user.id),
  });

  if (!tenant || !tenant.flyAppName || !tenant.flyMachineId) {
    return NextResponse.json({ error: "No instance found" }, { status: 404 });
  }

  if (tenant.status !== "cancelled") {
    return NextResponse.json(
      { error: "Can only destroy cancelled instances" },
      { status: 400 }
    );
  }

  try {
    await destroyMachine(tenant.flyAppName, tenant.flyMachineId);
    await destroyApp(tenant.flyAppName);

    await db
      .update(tenants)
      .set({
        flyMachineId: null,
        instanceUrl: null,
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenant.id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Destroy failed:", err);
    return NextResponse.json({ error: "Destroy failed" }, { status: 500 });
  }
}
