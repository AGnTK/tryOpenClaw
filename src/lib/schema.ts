import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";

export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name"),
  plan: text("plan").notNull().default("starter"),
  status: text("status").notNull().default("provisioning"),

  // Fly.io instance
  flyAppName: text("fly_app_name").unique(),
  flyMachineId: text("fly_machine_id"),
  flyRegion: text("fly_region").default("iad"),
  instanceUrl: text("instance_url"),

  // Stripe
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id"),

  // OpenClaw config
  gatewayToken: text("gateway_token"),
  defaultModel: text("default_model").default("anthropic/claude-sonnet-4-6"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const billingEvents = pgTable("billing_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  stripeEventId: text("stripe_event_id").unique().notNull(),
  eventType: text("event_type").notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  processedAt: timestamp("processed_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
export type BillingEvent = typeof billingEvents.$inferSelect;
