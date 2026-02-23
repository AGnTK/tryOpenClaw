import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase-server";
import { createPortalSession } from "@/lib/stripe";
import { db } from "@/lib/db";
import { tenants } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.userId, user.id),
  });

  if (!tenant?.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account" }, { status: 404 });
  }

  try {
    const portalUrl = await createPortalSession(tenant.stripeCustomerId);
    return NextResponse.json({ url: portalUrl });
  } catch (err) {
    console.error("Portal session creation failed:", err);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
