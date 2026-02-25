import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { tenants } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { createCheckoutSession, getFirstTimeCheckoutUrl } from "@/lib/stripe";

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
      // Already subscribed — go to dashboard
      return NextResponse.redirect(`${origin}/dashboard`);
    }

    if (!existing) {
      // First-time user — discounted Payment Link
      try {
        const paymentLinkUrl = getFirstTimeCheckoutUrl(user.id, user.email!);
        console.log("[callback] First-time user, Payment Link redirect:", user.id);
        return NextResponse.redirect(paymentLinkUrl);
      } catch (err) {
        console.error("[callback] Payment Link URL failed:", err);
        return NextResponse.redirect(`${origin}/checkout/cancel?error=checkout_failed`);
      }
    }

    // Cancelled user — regular Stripe Checkout
    try {
      console.log("[callback] Returning user checkout for:", user.id, user.email);
      const checkoutUrl = await createCheckoutSession(
        user.email!,
        "pro",
        user.id
      );
      return NextResponse.redirect(checkoutUrl);
    } catch (err) {
      console.error("[callback] Stripe checkout failed:", err);
      return NextResponse.redirect(`${origin}/checkout/cancel?error=checkout_failed`);
    }
  }

  // No code — redirect back to login
  return NextResponse.redirect(`${origin}/?error=no_code`);
}
