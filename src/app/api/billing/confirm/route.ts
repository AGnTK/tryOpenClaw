import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import { tenants } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getStripe } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessionId = request.nextUrl.searchParams.get("session_id") || "";
  if (!sessionId) return NextResponse.json({ error: "Missing session_id" }, { status: 400 });

  const session = await getStripe().checkout.sessions.retrieve(sessionId);

  const isPaid = session.payment_status === "paid" || session.status === "complete";
  if (!isPaid) return NextResponse.json({ ready: false }, { status: 202 });

  const email = session.customer_email || session.customer_details?.email || user.email || "";
  const stripeCustomerId = typeof session.customer === "string" ? session.customer : null;
  const stripeSubscriptionId = typeof session.subscription === "string" ? session.subscription : null;
  const plan = session.metadata?.plan || "pro";

  const existing = await db.query.tenants.findFirst({ where: eq(tenants.userId, user.id) });

  if (existing) {
    await db
      .update(tenants)
      .set({
        ...(email ? { email } : {}),
        plan,
        status: "paid",
        ...(stripeCustomerId ? { stripeCustomerId } : {}),
        ...(stripeSubscriptionId ? { stripeSubscriptionId } : {}),
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, existing.id));
  } else {
    await db.insert(tenants).values({
      userId: user.id,
      email,
      plan,
      status: "paid",
      stripeCustomerId,
      stripeSubscriptionId,
    });
  }

  return NextResponse.json({ ready: true });
}
