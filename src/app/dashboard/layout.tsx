import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase-server";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { db } from "@/lib/db";
import { tenants } from "@/lib/schema";
import { eq } from "drizzle-orm";
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
  });

  if (!tenant || tenant.status === "cancelled") {
    // No subscription — redirect to Stripe Checkout
    let checkoutUrl: string | null = null;
    try {
      checkoutUrl = await createCheckoutSession(user.email!, "starter", user.id);
    } catch (err) {
      console.error("[dashboard] Failed to create checkout:", err);
    }
    if (checkoutUrl) {
      redirect(checkoutUrl);
    } else {
      redirect("/?error=checkout_failed");
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader email={user.email || ""} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
