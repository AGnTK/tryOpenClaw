"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";

export default function BillingPage() {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Manage your subscription and payment methods
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Management
          </CardTitle>
          <CardDescription>
            View invoices, update payment methods, and change your plan through the Stripe
            Customer Portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={openPortal} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="mr-2 h-4 w-4" />
            )}
            Open Billing Portal
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            You&apos;ll be redirected to Stripe where you can manage your subscription,
            view past invoices, and update your payment method.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plans</CardTitle>
          <CardDescription>Your current plan determines your instance resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <PlanCard
              name="Starter"
              price="$19/mo"
              features={["512MB RAM", "Shared CPU", "1GB storage", "Auto-sleep/wake"]}
            />
            <PlanCard
              name="Pro"
              price="$49/mo"
              features={["1GB RAM", "Shared CPU", "1GB storage", "Auto-sleep/wake", "Priority support"]}
              highlighted
            />
            <PlanCard
              name="Enterprise"
              price="$149/mo"
              features={["2GB RAM", "Dedicated CPU", "1GB storage", "Always-on option", "Dedicated support"]}
            />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            To change plans, use the Billing Portal above. Changes take effect immediately
            and your instance will be resized automatically.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function PlanCard({
  name,
  price,
  features,
  highlighted,
}: {
  name: string;
  price: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-lg border p-4 ${
        highlighted ? "border-primary ring-1 ring-primary" : ""
      }`}
    >
      <h3 className="font-semibold">{name}</h3>
      <p className="text-2xl font-bold">{price}</p>
      <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-1">
            <span className="text-success">&#10003;</span> {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
