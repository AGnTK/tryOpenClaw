import Stripe from "stripe";
import { getPostHogServer } from "@/lib/posthog-server";

let _stripe: Stripe | null = null;

function env(key: string): string {
  return (process.env[key] || "").trim();
}

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(env("STRIPE_SECRET_KEY"));
  }
  return _stripe;
}

function getPriceId(plan: string): string {
  const priceMap: Record<string, string> = {
    starter: env("STRIPE_PRICE_STARTER"),
    pro: env("STRIPE_PRICE_PRO"),
    enterprise: env("STRIPE_PRICE_ENTERPRISE"),
  };
  const id = priceMap[plan] || env("STRIPE_PRICE_PRO") || env("STRIPE_PRICE_STARTER");
  if (!id) throw new Error(`No price ID found for plan: ${plan}`);
  return id;
}

export async function createCheckoutSession(
  customerEmail: string,
  plan: string,
  userId: string,
  firstTime: boolean = false
): Promise<{ url: string; sessionId: string }> {
  const promoId = "promo_1T43vLSIzJkYmjrZN22cvGZu";
  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer_email: customerEmail,
    line_items: [{ price: getPriceId(plan), quantity: 1 }],
    ...(firstTime ? { discounts: [{ promotion_code: promoId }] } : {}),
    success_url: `${env("NEXT_PUBLIC_APP_URL")}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env("NEXT_PUBLIC_APP_URL")}/checkout/cancel`,
    metadata: { userId, plan, first_time: String(firstTime) },
  });

  // Track checkout_started event - canonical funnel step
  getPostHogServer()?.capture({
    distinctId: userId,
    event: "checkout_started",
    properties: {
      user_id: userId,
      plan,
      stripe_checkout_session_id: session.id,
      first_time: firstTime,
    },
  });

  return { url: session.url!, sessionId: session.id };
}


export async function createPortalSession(customerId: string): Promise<string> {
  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env("NEXT_PUBLIC_APP_URL")}/dashboard/billing`,
  });
  return session.url;
}

export async function constructWebhookEvent(
  body: string,
  signature: string
): Promise<Stripe.Event> {
  return getStripe().webhooks.constructEvent(
    body,
    signature,
    env("STRIPE_WEBHOOK_SECRET")
  );
}
