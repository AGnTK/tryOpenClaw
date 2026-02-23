"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle } from "lucide-react";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"polling" | "ready" | "timeout">("polling");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      for (let i = 0; i < 30; i++) {
        if (cancelled) return;

        try {
          const res = await fetch("/api/instance/status");
          if (res.ok) {
            setStatus("ready");
            // Brief pause to show success state
            await new Promise((r) => setTimeout(r, 1500));
            if (!cancelled) router.push("/dashboard");
            return;
          }
        } catch {
          // Ignore network errors, keep polling
        }

        setAttempts(i + 1);
        await new Promise((r) => setTimeout(r, 2000));
      }

      if (!cancelled) setStatus("timeout");
    }

    poll();
    return () => { cancelled = true; };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          {status === "ready" ? (
            <>
              <div className="mx-auto mb-2">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <CardTitle>Payment Successful!</CardTitle>
              <CardDescription>Redirecting to your dashboard...</CardDescription>
            </>
          ) : status === "timeout" ? (
            <>
              <CardTitle>Taking Longer Than Expected</CardTitle>
              <CardDescription>
                Your payment was received but instance setup is still in progress.
                Please refresh the page or go to your dashboard.
              </CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto mb-2">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
              </div>
              <CardTitle>Setting Up Your Instance</CardTitle>
              <CardDescription>
                Payment received! Provisioning your OpenClaw instance...
              </CardDescription>
            </>
          )}
        </CardHeader>
        {status === "timeout" && (
          <CardContent>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-primary underline"
            >
              Go to Dashboard
            </button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
