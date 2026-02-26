import Stripe from "stripe";

let _stripe: Stripe | null = null;

function env(key: string): string {
  return (process.env[key] || "").trim();
}

function getStripe(): Stripe {
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
  userId: string
): Promise<string> {
  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer_email: customerEmail,
    line_items: [{ price: getPriceId(plan), quantity: 1 }],
    success_url: `${env("NEXT_PUBLIC_APP_URL")}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env("NEXT_PUBLIC_APP_URL")}/checkout/cancel`,
    metadata: { userId, plan },
  });

  return session.url!;
}

export function getFirstTimeCheckoutUrl(userId: string, email: string): string {
  const base = env("STRIPE_FIRST_TIME_LINK");
  if (!base) throw new Error("STRIPE_FIRST_TIME_LINK env var not set");
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}client_reference_id=${encodeURIComponent(userId)}&prefilled_email=${encodeURIComponent(email)}`;
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
