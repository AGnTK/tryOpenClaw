"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";

type CheckoutStatus = "polling" | "ready" | "auth_required" | "error";

const POLL_INTERVAL_MS = 2000;
const READY_REDIRECT_DELAY_MS = 1200;
const MAX_AUTH_FAILURES = 3;
const MAX_TRANSIENT_FAILURES = 15;
const MAX_POLL_MS = 2 * 60 * 1000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  const sessionId = (searchParams.get("session_id") || "").trim();

  const [status, setStatus] = useState<CheckoutStatus>("polling");
  const [errorText, setErrorText] = useState("");

  const trackedPosthog = useRef(false);
  const trackedGtag = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const startedAt = Date.now();

    let authFailures = 0;
    let transientFailures = 0;

    function trackConfirmedSuccess() {
      if (!trackedPosthog.current) {
        posthog?.capture("checkout_completed");
        trackedPosthog.current = true;
      }

      if (
        !trackedGtag.current &&
        sessionId &&
        typeof window !== "undefined" &&
        typeof window.gtag === "function"
      ) {
        window.gtag("event", "conversion", {
          send_to: "AW-11496747252/TktnCJrF2_0bEPThieoq",
          transaction_id: sessionId,
        });
        trackedGtag.current = true;
      }
    }

    async function poll() {
      if (!sessionId) {
        setStatus("error");
        setErrorText("Missing checkout session. Please retry checkout.");
        return;
      }

      while (!cancelled) {
        if (Date.now() - startedAt > MAX_POLL_MS) {
          setStatus("error");
          setErrorText("Payment confirmation is taking longer than expected.");
          return;
        }

        try {
          const res = await fetch(
            `/api/billing/confirm?session_id=${encodeURIComponent(sessionId)}`,
            {
              method: "GET",
              cache: "no-store",
              credentials: "include",
              headers: { Accept: "application/json" },
            }
          );

          if (res.status === 401) {
            authFailures += 1;
            if (authFailures >= MAX_AUTH_FAILURES) {
              setStatus("auth_required");
              return;
            }
            await sleep(1500);
            continue;
          }

          if (res.status === 403) {
            setStatus("error");
            setErrorText("This checkout session belongs to another account.");
            return;
          }

          if (res.status === 400) {
            setStatus("error");
            setErrorText("Invalid checkout session.");
            return;
          }

          if (res.ok) {
            const data = (await res.json()) as { ready?: boolean };
            if (data.ready) {
              trackConfirmedSuccess();
              setStatus("ready");
              await sleep(READY_REDIRECT_DELAY_MS);
              if (!cancelled) router.push("/dashboard");
              return;
            }

            transientFailures = 0;
            await sleep(POLL_INTERVAL_MS);
            continue;
          }

          if (res.status === 202 || res.status === 429 || res.status >= 500) {
            transientFailures += 1;
            if (transientFailures >= MAX_TRANSIENT_FAILURES) {
              setStatus("error");
              setErrorText("Could not confirm payment automatically.");
              return;
            }
            await sleep(POLL_INTERVAL_MS);
            continue;
          }

          setStatus("error");
          setErrorText("Unable to confirm payment.");
          return;
        } catch {
          transientFailures += 1;
          if (transientFailures >= MAX_TRANSIENT_FAILURES) {
            setStatus("error");
            setErrorText("Network issue while confirming payment.");
            return;
          }
          await sleep(POLL_INTERVAL_MS);
        }
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [posthog, router, sessionId]);

  const pageStyle = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)",
    backgroundSize: "24px 24px",
    backgroundColor: "#ffffff",
    padding: "24px",
  };

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "clamp(28px, 5vw, 48px) clamp(20px, 4vw, 40px)",
    maxWidth: "460px",
    width: "100%",
    textAlign: "center" as const,
  };

  const linkStyle = {
    color: "#0d9488",
    textDecoration: "underline",
    fontSize: "15px",
  };

  return (
    <div style={pageStyle}>
      <a
        href="/"
        style={{
          textDecoration: "none",
          color: "#050810",
          fontWeight: 700,
          fontSize: "18px",
          marginBottom: "36px",
        }}
      >
        OpenClaw
      </a>

      <div style={cardStyle}>
        {status === "polling" && (
          <>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#050810", margin: "0 0 8px" }}>
              Payment Received!
            </h1>
            <p style={{ fontSize: "15px", color: "#4b5563", margin: 0, lineHeight: 1.6 }}>
              Confirming your subscription...
            </p>
          </>
        )}

        {status === "ready" && (
          <>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#050810", margin: "0 0 8px" }}>
              Payment Successful!
            </h1>
            <p style={{ fontSize: "15px", color: "#4b5563", margin: "0 0 12px", lineHeight: 1.6 }}>
              Redirecting to your dashboard...
            </p>
            <a href="/dashboard" style={linkStyle}>
              Go to your dashboard
            </a>
          </>
        )}

        {status === "auth_required" && (
          <>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#050810", margin: "0 0 8px" }}>
              Payment Received
            </h1>
            <p style={{ fontSize: "15px", color: "#4b5563", margin: "0 0 12px", lineHeight: 1.6 }}>
              Your login session expired after Stripe redirect. Sign in again to continue.
            </p>
            <p style={{ margin: "0 0 8px" }}>
              <a href="/" style={linkStyle}>
                Sign in again
              </a>
            </p>
            <p style={{ margin: 0 }}>
              <a href="/dashboard" style={linkStyle}>
                Go to dashboard
              </a>
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#050810", margin: "0 0 8px" }}>
              We Need One More Step
            </h1>
            <p style={{ fontSize: "15px", color: "#4b5563", margin: "0 0 12px", lineHeight: 1.6 }}>
              {errorText || "Could not verify payment automatically."}
            </p>
            <p style={{ margin: "0 0 8px" }}>
              <a href="/dashboard" style={linkStyle}>
                Go to dashboard
              </a>
            </p>
            <p style={{ margin: 0 }}>
              <a href="/checkout/cancel" style={linkStyle}>
                Retry checkout
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
