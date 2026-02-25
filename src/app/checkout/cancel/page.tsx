"use client";

import { useState } from "react";

export default function CheckoutCancelPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRetry() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "starter" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to create checkout");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

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
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(239,68,68,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M15 9l-6 6" />
            <path d="M9 9l6 6" />
          </svg>
        </div>

        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#050810", margin: "0 0 8px", letterSpacing: "-0.02em" }}>Checkout Cancelled</h1>
        <p style={{ fontSize: "15px", color: "#4b5563", margin: "0 0 28px", lineHeight: 1.6 }}>
          No worries — you can try again whenever you&apos;re ready.
        </p>

        {error && (
          <p style={{ fontSize: "13px", color: "#dc2626", marginBottom: "16px" }}>{error}</p>
        )}

        <button
          onClick={handleRetry}
          disabled={loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            padding: "12px 24px",
            minHeight: "44px",
            background: "#dc2626",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            transition: "all 0.2s",
            marginBottom: "16px",
          }}
          onMouseOver={(e) => { if (!loading) (e.target as HTMLButtonElement).style.background = "#b91c1c"; }}
          onMouseOut={(e) => { (e.target as HTMLButtonElement).style.background = "#dc2626"; }}
        >
          {loading ? "Redirecting..." : "Try Again"}
        </button>

        <a
          href="/auth/logout"
          style={{
            display: "block",
            fontSize: "14px",
            color: "#4b5563",
            textDecoration: "none",
            transition: "color 0.2s",
            padding: "10px 0",
          }}
          onMouseOver={(e) => { (e.target as HTMLAnchorElement).style.color = "#050810"; }}
          onMouseOut={(e) => { (e.target as HTMLAnchorElement).style.color = "#4b5563"; }}
        >
          Sign Out
        </a>
      </div>
    </div>
  );
}
