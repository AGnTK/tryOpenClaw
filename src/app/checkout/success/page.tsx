"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const posthog = usePostHog();
  const tracked = useRef(false);
  const [status, setStatus] = useState<"polling" | "ready">("polling");

  useEffect(() => {
    const sessionId = searchParams.get("session_id") || "";
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "conversion", {
        send_to: "AW-11496747252/TktnCJrF2_0bEPThieoq",
        transaction_id: sessionId,
      });
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      while (!cancelled) {
        try {
          const res = await fetch("/api/instance/status");
          if (res.ok) {
            if (!tracked.current) {
              posthog?.capture("checkout_completed");
              tracked.current = true;
            }
            setStatus("ready");
            await new Promise((r) => setTimeout(r, 1500));
            if (!cancelled) router.push("/dashboard");
            return;
          }
        } catch {
          // Ignore, keep polling
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    poll();
    return () => { cancelled = true; };
  }, [router]);

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)",
      backgroundSize: "24px 24px",
      backgroundColor: "#ffffff",
      padding: "24px",
    }}>
      {/* Logo */}
      <a href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "#050810", fontWeight: 700, fontSize: "18px", marginBottom: "48px" }}>
        <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
          <defs><linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{ stopColor: "#ff4d4d" }} /><stop offset="100%" style={{ stopColor: "#991b1b" }} /></linearGradient></defs>
          <ellipse cx="50" cy="55" rx="35" ry="28" fill="url(#lg)" /><ellipse cx="50" cy="45" rx="25" ry="18" fill="url(#lg)" />
          <circle cx="38" cy="42" r="4" fill="#fff" /><circle cx="62" cy="42" r="4" fill="#fff" />
          <path d="M25 55 Q15 45 10 55 Q5 65 15 60 Q20 58 25 55" fill="url(#lg)" /><path d="M75 55 Q85 45 90 55 Q95 65 85 60 Q80 58 75 55" fill="url(#lg)" />
          <path d="M30 35 Q25 25 20 30 Q15 35 25 38" fill="url(#lg)" /><path d="M70 35 Q75 25 80 30 Q85 35 75 38" fill="url(#lg)" />
        </svg>
        OpenClaw
      </a>

      {/* Card */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "clamp(28px, 5vw, 48px) clamp(20px, 4vw, 40px)",
        maxWidth: "440px",
        width: "100%",
        textAlign: "center",
      }}>
        {status === "ready" ? (
          <>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(13,148,136,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#050810", margin: "0 0 8px", letterSpacing: "-0.02em" }}>Payment Successful!</h1>
            <p style={{ fontSize: "15px", color: "#4b5563", margin: 0, lineHeight: 1.6 }}>Redirecting to your dashboard...</p>
          </>
        ) : (
          <>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(239,68,68,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#050810", margin: "0 0 8px", letterSpacing: "-0.02em" }}>Payment Received!</h1>
            <p style={{ fontSize: "15px", color: "#4b5563", margin: 0, lineHeight: 1.6 }}>Confirming your subscription...</p>
          </>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
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
