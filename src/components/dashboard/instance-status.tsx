"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  RefreshCw,
  RotateCcw,
  Loader2,
  Globe,
  MessageSquare,
  Bot,
  Copy,
  Check,
  Power,
  Rocket,
} from "lucide-react";

type InstanceData = {
  tenantStatus: string;
  machineState: string | null;
  instanceUrl: string | null;
  gatewayToken: string | null;
  plan: string;
  region: string;
};

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }> = {
  started: { label: "Running", variant: "success" },
  stopped: { label: "Sleeping", variant: "secondary" },
  starting: { label: "Starting", variant: "warning" },
  stopping: { label: "Stopping", variant: "warning" },
  created: { label: "Created", variant: "secondary" },
  destroyed: { label: "Destroyed", variant: "destructive" },
  failed: { label: "Failed", variant: "destructive" },
};

export function InstanceStatus() {
  const [data, setData] = useState<InstanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [restarting, setRestarting] = useState(false);
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/instance/status");
      if (res.ok) {
        setData(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  async function handleRestart() {
    setRestarting(true);
    try {
      await fetch("/api/instance/restart", { method: "POST" });
      setTimeout(fetchStatus, 3000);
    } finally {
      setRestarting(false);
    }
  }

  async function handleStart() {
    setStarting(true);
    try {
      await fetch("/api/instance/start", { method: "POST" });
      setTimeout(fetchStatus, 3000);
    } finally {
      setStarting(false);
    }
  }

  async function handleStop() {
    setStopping(true);
    try {
      await fetch("/api/instance/stop", { method: "POST" });
      setTimeout(fetchStatus, 3000);
    } finally {
      setStopping(false);
    }
  }

  function handleCopyUrl() {
    if (data?.instanceUrl) {
      navigator.clipboard.writeText(data.instanceUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleLaunch() {
    setLaunching(true);
    setLaunchError(null);
    try {
      const res = await fetch("/api/instance/provision", { method: "POST" });
      const body = await res.json();
      if (!res.ok) {
        setLaunchError(body.error || "Provisioning failed");
      } else {
        const url = body.gatewayToken
          ? `${body.instanceUrl}?token=${body.gatewayToken}`
          : body.instanceUrl;
        if (url) window.open(url, "_blank", "noopener,noreferrer");
        fetchStatus();
      }
    } catch {
      setLaunchError("Network error. Please try again.");
    } finally {
      setLaunching(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (data.tenantStatus === "paid") {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <Rocket className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Payment Successful!</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Your account is ready. Click below to provision your OpenClaw instance on Fly.io. This usually takes 1-2 minutes.
          </p>
          {launchError && (
            <p className="mt-3 text-sm text-destructive">{launchError}</p>
          )}
          <Button
            size="lg"
            className="mt-6 gap-2 px-8 text-base"
            onClick={handleLaunch}
            disabled={launching}
          >
            {launching ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Rocket className="h-5 w-5" />
            )}
            {launching ? "Launching..." : "Launch Your OpenClaw"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (data.tenantStatus === "provisioning") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Setting Up Your Assistant</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Your OpenClaw instance is being provisioned on Fly.io. This usually takes 1-2 minutes.
            The page will update automatically.
          </p>
        </CardContent>
      </Card>
    );
  }

  const badge = data.machineState
    ? STATUS_BADGE[data.machineState] || { label: data.machineState, variant: "outline" as const }
    : { label: data.tenantStatus, variant: "secondary" as const };

  const isRunning = data.machineState === "started";
  const isSleeping = data.machineState === "stopped";
  const dashboardUrl = data.gatewayToken
    ? `${data.instanceUrl}?token=${data.gatewayToken}`
    : data.instanceUrl;

  return (
    <div className="space-y-6">
      {/* Hero: Open Dashboard */}
      {data.instanceUrl && data.tenantStatus === "active" && (
        <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardContent className="flex flex-col items-center py-10 text-center">
            <div className="mb-4 flex items-center gap-2">
              {isRunning && <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
              </span>}
              <span className="text-lg font-semibold">
                {isRunning ? "Your assistant is live" : isSleeping ? "Your assistant is sleeping" : "Your assistant"}
              </span>
              <Badge variant={badge.variant}>{badge.label}</Badge>
            </div>
            <p className="mb-6 max-w-lg text-sm text-muted-foreground">
              {isRunning
                ? "Your OpenClaw instance is running. Open the dashboard to configure AI models, connect channels, and manage your assistant."
                : isSleeping
                ? "Your instance is sleeping to save resources. It will wake automatically on the next request (30-60s cold start)."
                : "Manage your AI assistant — configure models, channels, guardrails, and more."}
            </p>
            <a
              href={dashboardUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="gap-2 px-8 text-base">
                <ExternalLink className="h-5 w-5" />
                Open Assistant Dashboard
              </Button>
            </a>
            {isSleeping && (
              <p className="mt-3 text-xs text-muted-foreground">
                Opening the dashboard will wake your instance. First load may take 30-60 seconds.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instance Info + Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Instance URL */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4" />
              Instance URL
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.instanceUrl ? (
              <>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded bg-muted px-2 py-1.5 text-xs">
                    {data.instanceUrl}
                  </code>
                  <Button variant="ghost" size="sm" onClick={handleCopyUrl} className="shrink-0">
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Use this URL for Telegram, Discord, and Slack webhook callbacks.
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Not available yet</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Power className="h-4 w-4" />
              Instance Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStatus}
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Refresh
            </Button>
            {isSleeping && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleStart}
                disabled={starting}
              >
                {starting ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Power className="mr-1.5 h-3.5 w-3.5" />
                )}
                Start
              </Button>
            )}
            {isRunning && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStop}
                  disabled={stopping}
                >
                  {stopping ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Power className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Stop
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRestart}
                  disabled={restarting}
                >
                  {restarting ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Restart
                </Button>
              </>
            )}
            <div className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs text-muted-foreground">
              Plan: <span className="font-medium text-foreground capitalize">{data.plan}</span>
              &middot; Region: <span className="font-medium text-foreground uppercase">{data.region || "iad"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-4 w-4" />
            Get Started With Your Assistant
          </CardTitle>
          <CardDescription>
            Everything is configured inside the OpenClaw dashboard. Here&apos;s what to do first:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <SetupStep
              icon={<MessageSquare className="h-5 w-5" />}
              title="Connect a channel"
              description="Set up Telegram, Discord, Slack, WhatsApp, or Web Chat to talk to your assistant."
            />
            <SetupStep
              icon={
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              }
              title="Choose an AI model"
              description="Pick your model (Kimi K2.5, Claude, GPT-4, Gemini) and add your API keys."
            />
            <SetupStep
              icon={
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              }
              title="Set up guardrails"
              description="Enable sandbox mode, content filters, and approval workflows for safety."
            />
            <SetupStep
              icon={
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              }
              title="Customize personality"
              description="Define your assistant's persona, skills, and conversation style."
            />
          </div>
          <div className="mt-4 text-center">
            <a href={dashboardUrl || "#"} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Open Dashboard to Configure
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Status alerts */}
      {data.tenantStatus === "suspended" && (
        <Card className="border-destructive/50">
          <CardContent className="py-4">
            <p className="text-sm text-destructive">
              Your instance is suspended due to a payment issue. Please update your payment method in the billing section.
            </p>
          </CardContent>
        </Card>
      )}
      {data.tenantStatus === "cancelled" && (
        <Card className="border-muted">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">
              Your subscription has been cancelled. Your instance will be removed after the grace period.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SetupStep({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-3 rounded-lg border p-3">
      <div className="mt-0.5 shrink-0 text-muted-foreground">{icon}</div>
      <div>
        <h4 className="text-sm font-medium">{title}</h4>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
