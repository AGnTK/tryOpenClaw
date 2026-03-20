import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase-server";
import { createCheckoutSession } from "@/lib/stripe";
import { db } from "@/lib/db";
import { tenants } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    console.error("[checkout] No authenticated user");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[checkout] User:", user.id, user.email);

  // Check if user already has a tenant
  const existing = await db.query.tenants.findFirst({
    where: eq(tenants.userId, user.id),
  });

  if (existing && existing.status !== "cancelled") {
    console.log("[checkout] User already has tenant:", existing.id, existing.status);
    return NextResponse.json(
      { error: "Already have an active instance" },
      { status: 400 }
    );
  }

  const { plan = "pro" } = await request.json().catch(() => ({ plan: "pro" }));

  try {
    console.log("[checkout] Creating session for plan:", plan);
    const { url } = await createCheckoutSession(
      user.email!,
      plan,
      user.id
    );
    console.log("[checkout] Success, URL:", url);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[checkout] Stripe error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Checkout failed: ${message}` },
      { status: 500 }
    );
  }
}
