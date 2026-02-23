import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import { tenants } from "@/lib/schema";
import { eq } from "drizzle-orm";

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

  return NextResponse.json({
    status: tenant.status,
    instanceUrl: tenant.instanceUrl,
    flyAppName: tenant.flyAppName,
    plan: tenant.plan,
  });
}
