import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase-server";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { db } from "@/lib/db";
import { tenants } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { createCheckoutSession, getFirstTimeCheckoutUrl } from "@/lib/stripe";

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
    // First-time user — discounted Payment Link
    try {
      const paymentLinkUrl = getFirstTimeCheckoutUrl(user.id, user.email!);
      redirect(paymentLinkUrl);
    } catch (err) {
      console.error("[dashboard] Payment Link URL failed:", err);
      redirect("/checkout/cancel?error=checkout_failed");
    }
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
