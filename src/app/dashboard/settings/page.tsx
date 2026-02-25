"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  async function handleDeleteAccount() {
    if (!confirm("Are you sure? This will cancel your subscription and destroy your instance.")) {
      return;
    }
    // Redirect to Stripe portal for cancellation
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Account and instance settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Instance Configuration
          </CardTitle>
          <CardDescription>
            All OpenClaw configuration is done through your instance&apos;s admin dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            All OpenClaw configuration is done through the built-in web dashboard
            at your instance URL (port 18789). Open it from the Dashboard page.
          </p>
          <p>Things you configure inside OpenClaw:</p>
          <ul className="list-inside list-disc space-y-1 text-xs">
            <li>AI model providers &amp; API keys (Anthropic, OpenAI, Gemini, OpenRouter)</li>
            <li>Messaging channels (Telegram, Discord, Slack, WhatsApp, Signal, etc.)</li>
            <li>Agent personality, skills, and behavior</li>
            <li>Guardrails and content filters</li>
            <li>Heartbeat scheduler for autonomous operation</li>
            <li>Conversation memory and session settings</li>
          </ul>
          <p>
            This platform manages <strong className="text-foreground">billing and hosting only</strong>.
            Your data lives on a persistent volume attached to your Fly.io machine.
          </p>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Cancel Subscription</p>
              <p className="text-xs text-muted-foreground">
                Cancel your subscription and destroy your instance after the grace period.
              </p>
            </div>
            <Button variant="destructive" size="sm" onClick={handleDeleteAccount} className="w-full shrink-0 sm:w-auto">
              Cancel Subscription
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
