import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase-server";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { db } from "@/lib/db";
import { tenants } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { createCheckoutSession } from "@/lib/stripe";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/");
  }

  // Require active subscription to access dashboard
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.userId, user.id),
    orderBy: [desc(tenants.updatedAt)],
  });

  if (!tenant) {
    // First-time user — Stripe Checkout Session with first-time promo
    let checkoutUrl: string | null = null;
    try {
      checkoutUrl = await createCheckoutSession(user.email!, "pro", user.id, true);
    } catch (err) {
      console.error("[dashboard] Checkout session failed:", err);
    }
    if (!checkoutUrl) redirect("/checkout/cancel?error=checkout_failed");
    redirect(checkoutUrl);
  }

  if (tenant.status === "cancelled") {
    // Returning user — regular Stripe Checkout
    let checkoutUrl: string | null = null;
    try {
      checkoutUrl = await createCheckoutSession(user.email!, "pro", user.id);
    } catch (err) {
      console.error("[dashboard] Failed to create checkout:", err);
    }
    if (checkoutUrl) {
      redirect(checkoutUrl);
    } else {
      redirect("/checkout/cancel?error=checkout_failed");
    }
  }

  return (
    <DashboardShell email={user.email || ""}>
      {children}
    </DashboardShell>
  );
}
