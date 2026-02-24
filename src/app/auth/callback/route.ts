import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { tenants } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { createCheckoutSession } from "@/lib/stripe";

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

    // No tenant — redirect to Stripe Checkout
    try {
      console.log("[callback] Creating checkout for user:", user.id, user.email);
      const checkoutUrl = await createCheckoutSession(
        user.email!,
        "starter",
        user.id
      );
      console.log("[callback] Stripe checkout URL:", checkoutUrl);
      return NextResponse.redirect(checkoutUrl);
    } catch (err) {
      console.error("[callback] Stripe checkout failed:", err);
      // Redirect to dashboard with error flag so user can see what happened
      return NextResponse.redirect(`${origin}/dashboard?error=checkout_failed`);
    }
  }

  // No code — redirect back to login
  return NextResponse.redirect(`${origin}/?error=no_code`);
}
