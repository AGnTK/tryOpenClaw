import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { constructWebhookEvent } from "@/lib/stripe";
import { db } from "@/lib/db";
import { tenants, billingEvents } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { stopMachine, updateMachineSize } from "@/lib/fly";
import { getPostHogServer } from "@/lib/posthog-server";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = await constructWebhookEvent(body, signature);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotency check
  const existing = await db.query.billingEvents.findFirst({
    where: eq(billingEvents.stripeEventId, event.id),
  });
  if (existing) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(event);
        break;
    }
  } catch (err) {
    console.error(`Error handling ${event.type}:`, err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;

  const userId = session.metadata?.userId || session.client_reference_id;
  const plan = session.metadata?.plan || "pro";
  if (!userId) return;

  const email = session.customer_email || "";
  const stripeCustomerId = session.customer as string;
  const stripeSubscriptionId = session.subscription as string;

  // Upsert tenant — update if exists (returning user), insert if new
  const existing = await db.query.tenants.findFirst({
    where: eq(tenants.userId, userId),
  });

  let tenantId: string;

  if (existing) {
    await db
      .update(tenants)
      .set({
        ...(email ? { email } : {}),
        plan,
        status: "paid",
        stripeCustomerId,
        stripeSubscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, existing.id));
    tenantId = existing.id;
  } else {
    const [tenant] = await db
      .insert(tenants)
      .values({
        userId,
        email,
        plan,
        status: "paid",
        stripeCustomerId,
        stripeSubscriptionId,
      })
      .returning();
    tenantId = tenant.id;
  }

  // Log billing event
  await db.insert(billingEvents).values({
    stripeEventId: event.id,
    eventType: event.type,
    tenantId,
  });

  getPostHogServer()?.capture({
    distinctId: userId,
    event: "subscription_created",
    properties: {
      plan,
      email,
      stripe_customer_id: stripeCustomerId,
      first_time: !existing,
    },
  });
}

async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.stripeSubscriptionId, subscription.id),
  });
  if (!tenant) return;

  await db.insert(billingEvents).values({
    stripeEventId: event.id,
    eventType: event.type,
    tenantId: tenant.id,
  });

  if (tenant.flyAppName && tenant.flyMachineId) {
    try {
      await stopMachine(tenant.flyAppName, tenant.flyMachineId);
    } catch (err) {
      console.error(`Failed to stop machine for ${tenant.flyAppName}:`, err);
    }
  }

  await db
    .update(tenants)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(tenants.id, tenant.id));

  const lifetimeDays = tenant.createdAt
    ? Math.floor((Date.now() - new Date(tenant.createdAt).getTime()) / 86400000)
    : undefined;

  getPostHogServer()?.capture({
    distinctId: tenant.userId,
    event: "subscription_cancelled",
    properties: {
      plan: tenant.plan,
      lifetime_days: lifetimeDays,
    },
  });
}

async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.stripeSubscriptionId, subscription.id),
  });
  if (!tenant) return;

  await db.insert(billingEvents).values({
    stripeEventId: event.id,
    eventType: event.type,
    tenantId: tenant.id,
  });

  const priceId = subscription.items.data[0]?.price.id;
  let newPlan = tenant.plan;

  if (priceId === process.env.STRIPE_PRICE_STARTER) newPlan = "starter";
  else if (priceId === process.env.STRIPE_PRICE_PRO) newPlan = "pro";
  else if (priceId === process.env.STRIPE_PRICE_ENTERPRISE) newPlan = "enterprise";

  if (newPlan !== tenant.plan && tenant.flyAppName && tenant.flyMachineId) {
    try {
      await updateMachineSize(tenant.flyAppName, tenant.flyMachineId, newPlan);
    } catch (err) {
      console.error(`Failed to resize machine for ${tenant.flyAppName}:`, err);
    }
  }

  await db
    .update(tenants)
    .set({ plan: newPlan, updatedAt: new Date() })
    .where(eq(tenants.id, tenant.id));

  if (newPlan !== tenant.plan) {
    getPostHogServer()?.capture({
      distinctId: tenant.userId,
      event: "subscription_updated",
      properties: {
        old_plan: tenant.plan,
        new_plan: newPlan,
      },
    });
  }
}

async function handlePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as unknown as Record<string, unknown>;
  const rawSub = invoice.subscription;
  const subscriptionId =
    typeof rawSub === "string" ? rawSub : (rawSub as { id?: string })?.id;

  if (!subscriptionId) return;

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.stripeSubscriptionId, subscriptionId),
  });
  if (!tenant) return;

  await db.insert(billingEvents).values({
    stripeEventId: event.id,
    eventType: event.type,
    tenantId: tenant.id,
  });

  await db
    .update(tenants)
    .set({ status: "suspended", updatedAt: new Date() })
    .where(eq(tenants.id, tenant.id));

  getPostHogServer()?.capture({
    distinctId: tenant.userId,
    event: "payment_failed",
    properties: { plan: tenant.plan },
  });
}
