import Stripe from "stripe";

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return _stripe;
}

function getPriceId(): string {
  const id = process.env.STRIPE_PRICE_STARTER;
  if (!id) throw new Error("STRIPE_PRICE_STARTER not set");
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
    line_items: [{ price: getPriceId(), quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
    metadata: { userId, plan },
  });

  return session.url!;
}

export async function createPortalSession(customerId: string): Promise<string> {
  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
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
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
