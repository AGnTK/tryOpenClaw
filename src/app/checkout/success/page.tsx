"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle } from "lucide-react";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"polling" | "ready">("polling");

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      // Poll until Stripe webhook creates the tenant record
      while (!cancelled) {
        try {
          const res = await fetch("/api/instance/status");
          if (res.ok) {
            setStatus("ready");
            await new Promise((r) => setTimeout(r, 1500));
            if (!cancelled) router.push("/dashboard");
            return;
          }
        } catch {
          // Ignore network errors, keep polling
        }

        await new Promise((r) => setTimeout(r, 2000));
      }
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
          ) : (
            <>
              <div className="mx-auto mb-2">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
              </div>
              <CardTitle>Payment Received!</CardTitle>
              <CardDescription>
                Confirming your subscription...
              </CardDescription>
            </>
          )}
        </CardHeader>
      </Card>
    </div>
  );
}
