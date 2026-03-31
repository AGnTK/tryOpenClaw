"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePostHog } from "posthog-js/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  RefreshCw,
  RotateCcw,
  Loader2,
  Globe,
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
  suspended: { label: "Suspended", variant: "warning" },
  starting: { label: "Starting", variant: "warning" },
  stopping: { label: "Stopping", variant: "warning" },
  created: { label: "Created", variant: "secondary" },
  destroyed: { label: "Destroyed", variant: "destructive" },
  failed: { label: "Failed", variant: "destructive" },
};

const PROGRESS_STEPS = [
  { message: "Creating your cloud environment...", detail: "Setting up a dedicated server" },
  { message: "Allocating network resources...", detail: "Configuring DNS and IP addresses" },
  { message: "Preparing storage volume...", detail: "Creating persistent data store" },
  { message: "Deploying your assistant...", detail: "Pulling and starting OpenClaw" },
  { message: "Waiting for startup...", detail: "Your assistant is booting up" },
  { message: "Almost there...", detail: "Running final health checks" },
  { message: "Just a moment longer...", detail: "Verifying everything is ready" },
  { message: "Finalizing setup...", detail: "Wrapping things up for you" },
];

export function InstanceStatus() {
  const posthog = usePostHog();
  const [data, setData] = useState<InstanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [restarting, setRestarting] = useState(false);
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/instance/status");
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      // Network errors during polling are expected (offline, tab sleep, etc.)
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
    posthog?.capture("instance_restarted", { machine_state: data?.machineState });
    try {
      await fetch("/api/instance/restart", { method: "POST" });
      setTimeout(fetchStatus, 3000);
    } catch {
      // Network error — next poll will pick up state
    } finally {
      setRestarting(false);
    }
  }

  async function handleStart() {
    setStarting(true);
    posthog?.capture("instance_started", { machine_state: data?.machineState });
    try {
      await fetch("/api/instance/start", { method: "POST" });
      setTimeout(fetchStatus, 3000);
    } catch {
      // Network error — next poll will pick up state
    } finally {
      setStarting(false);
    }
  }

  async function handleStop() {
    setStopping(true);
    posthog?.capture("instance_stopped", { machine_state: data?.machineState });
    try {
      await fetch("/api/instance/stop", { method: "POST" });
      setTimeout(fetchStatus, 3000);
    } catch {
      // Network error — next poll will pick up state
    } finally {
      setStopping(false);
    }
  }

  function handleCopyUrl() {
    if (data?.instanceUrl) {
      navigator.clipboard.writeText(data.instanceUrl);
      setCopied(true);
      posthog?.capture("instance_url_copied");
      setTimeout(() => setCopied(false), 2000);
    }
  }

  // Auto-open dashboard when status transitions from provisioning → active
  const prevStatus = useRef<string | null>(null);
  useEffect(() => {
    if (
      prevStatus.current === "provisioning" &&
      data?.tenantStatus === "active" &&
      data.instanceUrl
    ) {
      const url = data.gatewayToken
        ? `${data.instanceUrl}#token=${data.gatewayToken}`
        : data.instanceUrl;
      posthog?.capture("instance_active");
      window.open(url, "_blank", "noopener,noreferrer");
    }
    // Clear launching spinner when status moves past "paid" (provisioning started)
    // or lands on "active" (provisioning complete)
    if (data?.tenantStatus && data.tenantStatus !== "paid" && launching) {
      // Keep launching=true while provisioning so spinner shows,
      // but clear it once we reach active/cancelled/etc.
      if (data.tenantStatus !== "provisioning") {
        if (progressInterval.current) clearInterval(progressInterval.current);
        setLaunching(false);
      }
    }
    if (data?.tenantStatus) {
      prevStatus.current = data.tenantStatus;
    }
  }, [data?.tenantStatus, data?.instanceUrl, data?.gatewayToken, launching]);

  async function handleLaunch() {
    posthog?.capture("instance_launch_clicked", { plan: data?.plan });
    setLaunching(true);
    setLaunchError(null);
    setProgressStep(0);

    // Cycle through progress messages every 20s
    progressInterval.current = setInterval(() => {
      setProgressStep((prev) => Math.min(prev + 1, PROGRESS_STEPS.length - 1));
    }, 20_000);

    try {
      const res = await fetch("/api/instance/provision", { method: "POST" });
      const body = await res.json();
      if (!res.ok) {
        setLaunchError(body.error || "Provisioning failed");
        if (progressInterval.current) clearInterval(progressInterval.current);
        setLaunching(false);
      } else {
        // Provision route returns immediately with "provisioning" status.
        // The 10s status poll will detect when the service is ready and
        // auto-promote to "active". Keep showing the spinner UI.
        fetchStatus();
      }
    } catch {
      setLaunchError("Network error. Please try again.");
      if (progressInterval.current) clearInterval(progressInterval.current);
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
    if (launching) {
      const step = PROGRESS_STEPS[progressStep];
      return (
        <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-6 relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: "2s" }} />
              <div className="relative rounded-full bg-primary/10 p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-semibold transition-opacity duration-500">
              {step.message}
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground transition-opacity duration-500">
              {step.detail}
            </p>
            <div className="mt-6 flex gap-1.5">
              {PROGRESS_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-6 rounded-full transition-colors duration-500 ${
                    i <= progressStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              This usually takes 3-5 minutes. Please don&apos;t close this page.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <Rocket className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Payment Successful!</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Your account is ready. Click below to provision your OpenClaw instance on Fly.io. This usually takes 3-5 minutes.
          </p>
          {launchError && (
            <p className="mt-3 text-sm text-destructive">{launchError}</p>
          )}
          <Button
            size="lg"
            className="mt-6 w-full gap-2 px-8 text-base sm:w-auto"
            onClick={handleLaunch}
          >
            <Rocket className="h-5 w-5" />
            Launch Your OpenClaw
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (data.tenantStatus === "provisioning") {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: "2s" }} />
            <div className="relative rounded-full bg-primary/10 p-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
          <h2 className="text-xl font-semibold">Setting Up Your Assistant</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Your OpenClaw instance is being provisioned. This usually takes 3-5 minutes.
            The page will update automatically.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Please don&apos;t close this page.
          </p>
        </CardContent>
      </Card>
    );
  }

  const badge = data.machineState
    ? STATUS_BADGE[data.machineState] || { label: data.machineState, variant: "outline" as const }
    : { label: data.tenantStatus, variant: "secondary" as const };

  const isRunning = data.machineState === "started";
  const isSleeping = data.machineState === "stopped" || data.machineState === "suspended";
  const dashboardUrl = data.gatewayToken
    ? `${data.instanceUrl}#token=${data.gatewayToken}`
    : data.instanceUrl;

  return (
    <div className="space-y-6">
      {/* Hero: Open Dashboard */}
      {data.instanceUrl && data.tenantStatus === "active" && (
        <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardContent className="flex flex-col items-center px-4 py-8 text-center sm:px-6 sm:py-10">
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
                ? "Your instance is sleeping to save resources. It will wake automatically on the next request (a few seconds)."
                : "Manage your AI assistant — configure models, channels, guardrails, and more."}
            </p>
            <a
              href={dashboardUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => posthog?.capture("instance_dashboard_opened", { instance_url: data.instanceUrl })}
            >
              <Button size="lg" className="w-full gap-2 px-8 text-base sm:w-auto">
                <ExternalLink className="h-5 w-5" />
                Open Assistant Dashboard
              </Button>
            </a>
            {isSleeping && (
              <p className="mt-3 text-xs text-muted-foreground">
                Opening the dashboard will wake your instance. First load may take a few seconds.
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
                  <code className="min-w-0 flex-1 truncate rounded bg-muted px-2 py-1.5 text-xs">
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
            <div className="flex flex-wrap items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs text-muted-foreground">
              Plan: <span className="font-medium text-foreground capitalize">{data.plan}</span>
              <span className="hidden sm:inline">&middot;</span>
              <span className="sm:hidden w-full" />
              Region: <span className="font-medium text-foreground uppercase">{data.region || "iad"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

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

