import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { tenants } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { createCheckoutSession } from "@/lib/stripe";
import { getPostHogServer } from "@/lib/posthog-server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore
            }
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("OAuth code exchange failed:", error.message);
      return NextResponse.redirect(`${origin}/?error=auth_failed`);
    }

    const user = data.user;
    if (!user) {
      return NextResponse.redirect(`${origin}/?error=no_user`);
    }

    // Check if user already has a paid tenant
    const existing = await db.query.tenants.findFirst({
      where: eq(tenants.userId, user.id),
    });

    if (existing && existing.status !== "cancelled") {
      // Already subscribed — go to dashboard (no funnel event)
      return NextResponse.redirect(`${origin}/dashboard`);
    }

    // User is entering purchase flow — track funnel start
    const isFirstTime = !existing;
    getPostHogServer()?.capture({
      distinctId: user.id,
      event: "auth_completed",
      properties: {
        user_id: user.id,
        email: user.email,
        first_time: isFirstTime,
      },
    });

    if (isFirstTime) {
      // First-time user — Stripe Checkout Session with first-time promo
      try {
        const { url } = await createCheckoutSession(user.email!, "pro", user.id, true);
        console.log("[callback] First-time user, Checkout Session redirect:", user.id);
        return NextResponse.redirect(url);
      } catch (err) {
        console.error("[callback] Checkout session failed:", err);
        return NextResponse.redirect(`${origin}/checkout/cancel?error=checkout_failed`);
      }
    }

    // Cancelled user — regular Stripe Checkout
    try {
      console.log("[callback] Returning user checkout for:", user.id, user.email);
      const { url } = await createCheckoutSession(
        user.email!,
        "pro",
        user.id
      );
      return NextResponse.redirect(url);
    } catch (err) {
      console.error("[callback] Stripe checkout failed:", err);
      return NextResponse.redirect(`${origin}/checkout/cancel?error=checkout_failed`);
    }
  }

  // No code — redirect back to login
  return NextResponse.redirect(`${origin}/?error=no_code`);
}
