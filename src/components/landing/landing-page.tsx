"use client";

import { useState } from "react";
import { usePostHog } from "posthog-js/react";
import { createSupabaseBrowser } from "@/lib/supabase-client";
import "./landing-page.css";

function signInWithGoogle() {
  const supabase = createSupabaseBrowser();
  supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent("/dashboard")}`,
    },
  });
}

/* Crab logo SVG used in navbar + footer */
function CrabLogo({ id }: { id: string }) {
  return (
    <svg className="logo-icon" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#ff4d4d" }} />
          <stop offset="100%" style={{ stopColor: "#991b1b" }} />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="55" rx="35" ry="28" fill={`url(#${id})`} />
      <ellipse cx="50" cy="45" rx="25" ry="18" fill={`url(#${id})`} />
      <circle cx="38" cy="42" r="4" fill="#ffffff" />
      <circle cx="62" cy="42" r="4" fill="#ffffff" />
      <path d="M25 55 Q15 45 10 55 Q5 65 15 60 Q20 58 25 55" fill={`url(#${id})`} />
      <path d="M75 55 Q85 45 90 55 Q95 65 85 60 Q80 58 75 55" fill={`url(#${id})`} />
      <path d="M30 35 Q25 25 20 30 Q15 35 25 38" fill={`url(#${id})`} />
      <path d="M70 35 Q75 25 80 30 Q85 35 75 38" fill={`url(#${id})`} />
    </svg>
  );
}

/* X/Twitter icon used in testimonial cards */
function XIcon() {
  return (
    <div className="tweet-icon">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    </div>
  );
}

const testimonials = [
  { name: "Jonah", handle: "@jonahships_", img: "jonahships_.webp", quote: "Setup OpenClaw yesterday. All I have to say is, wow." },
  { name: "Dave Morin", handle: "@davemorin", img: "davemorin.webp", quote: "First time I felt like living in the future since ChatGPT." },
  { name: "Therno", handle: "@therno", img: "therno.webp", quote: "It's running my company." },
  { name: "Swyx", handle: "@swyx", img: "swyx.webp", quote: "OpenClaw feels like that 'glue all parts together' leap forward." },
  { name: "Christine Tyip", handle: "@christinetyip", img: "christinetyip.webp", quote: "The automation capabilities are unmatched. Saved me hours every week." },
  { name: "Nat Eliason", handle: "@nateliason", img: "nateliason.webp", quote: "Finally, an AI assistant that actually works autonomously." },
  { name: "Christoph Nakazawa", handle: "@cnakazawa", img: "cnakazawa.webp", quote: "This is genuinely impressive. Deployed in 30 seconds." },
  { name: "Nick Vasiles", handle: "@nickvasiles", img: "nickvasiles.webp", quote: "Been waiting for something like this. No more server headaches." },
  { name: "Dan Peguine", handle: "@danpeguine", img: "danpeguine.webp", quote: "My team's productivity went through the roof with OpenClaw." },
];

const useCases = [
  "Translate messages", "Organize inbox", "Answer support tickets", "Summarize documents",
  "Meeting notifications", "Auto-reply", "Draft emails", "Schedule across time zones",
  "Track expenses", "Compare quotes", "Manage subscriptions", "Set reminders",
  "Automate data entry", "Find discounts", "Price alerts", "Compare products",
  "Negotiate deals", "Payroll", "Monitor pricing", "Track shipments",
  "Generate invoices", "Create presentations", "Book travel", "Find recipes",
  "Write agendas", "Summarize research", "Screen outreach", "Draft job descriptions",
  "Run standups", "Track OKRs", "Monitor mentions", "Generate reports", "Onboard teams",
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const posthog = usePostHog();

  function trackAndSignIn(location: string) {
    posthog?.capture("get_started_clicked", { location });
    signInWithGoogle();
  }

  return (
    <>
      <div className="landing-page">
        {/* Announcement Banner */}
        <div className="announcement-banner">
          <p><span>Open Beta</span> — Deploy your personal AI assistant in under a minute.</p>
        </div>

        {/* Navigation */}
        <nav className="navbar">
          <div className="container">
            <a href="#" className="logo">
              <CrabLogo id="logoGradient" />
              OpenClaw
            </a>
            <div className="nav-links nav-links-desktop">
              <a href="mailto:support@tryopenclawai.com">Contact Support</a>
              <button onClick={() => trackAndSignIn("navbar")} className="btn btn-primary">Get Started</button>
            </div>
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18" /><path d="M6 6l12 12" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12h18" /><path d="M3 6h18" /><path d="M3 18h18" />
                </svg>
              )}
            </button>
          </div>
          {/* Mobile dropdown menu */}
          {mobileMenuOpen && (
            <div className="mobile-menu">
              <a href="mailto:support@tryopenclawai.com" onClick={() => setMobileMenuOpen(false)}>Contact Support</a>
              <button onClick={() => { setMobileMenuOpen(false); trackAndSignIn("navbar"); }} className="btn btn-primary">Get Started</button>
            </div>
          )}
        </nav>

        {/* Hero Section */}
        <section className="hero">
          <div className="container">
            <h1>Deploy <span>OpenClaw</span> <br className="desktop-break" />in Under 1 Minute</h1>
            <p>Your own 24/7 AI assistant on Telegram, Discord, or WhatsApp. Pick a model, choose a channel, and deploy — no server setup, no code, no configuration.</p>

            <div className="hero-logos-row">
              <span className="hero-logos-label">Powered by:</span>
              <div className="hero-logo">
                <img src="/logos/claude.svg" alt="Claude" />
                <span>Claude</span>
              </div>
              <div className="hero-logo">
                <img src="/logos/chatgpt.svg" alt="ChatGPT" />
                <span>ChatGPT</span>
              </div>
              <div className="hero-logo">
                <img src="/logos/gemini.webp" alt="Gemini" />
                <span>Gemini</span>
              </div>

              <span className="logo-spacer"></span>

              <span className="hero-logos-label">Available On:</span>
              <div className="hero-logo">
                <img src="/logos/telegram.webp" alt="Telegram" />
                <span>Telegram</span>
              </div>
              <div className="hero-logo">
                <img src="/logos/discord.webp" alt="Discord" />
                <span>Discord</span>
              </div>
              <div className="hero-logo">
                <img src="/logos/whatsapp.webp" alt="WhatsApp" />
                <span>WhatsApp</span>
              </div>
            </div>

            <button onClick={() => trackAndSignIn("hero")} className="btn btn-primary">Get Started</button>
            <p className="hero-subtitle">Set up in under a minute. Cancel anytime. <a href="/money-back-guarantee" className="hero-guarantee-link">Moneyback guarantee</a>.</p>
          </div>
        </section>

        {/* Social Proof */}
        <section className="social-proof">
          <div className="container">
            <p className="social-proof-label">Trusted by teams at</p>
            <div className="company-logos">
              {["google", "meta", "openai", "anthropic", "stripe", "vercel"].map((c) => (
                <span key={c} className="company-logo">
                  <img src={`/logos/${c}.svg`} alt={c.charAt(0).toUpperCase() + c.slice(1)} />
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="comparison">
          <div className="container">
            <h2>Why OpenClaw?</h2>
            <div className="comparison-grid">
              <div className="comparison-card">
                <h3>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                  Traditional Setup
                </h3>
                {[
                  ["Purchasing a VM", "15 min"],
                  ["Creating SSH keys", "10 min"],
                  ["Installing dependencies", "10 min"],
                  ["Configuring environment", "10 min"],
                  ["Setting up the bot", "10 min"],
                  ["Debugging webhooks", "5 min"],
                ].map(([label, value]) => (
                  <div key={label} className="comparison-item">
                    <span className="label">{label}</span>
                    <span className="value">{value}</span>
                  </div>
                ))}
                <div className="comparison-total">
                  <span className="label">Total</span>
                  <span className="value">60 min</span>
                </div>
                <p className="comparison-note">If you&apos;re non-technical, multiply these times by 10.</p>
              </div>
              <div className="comparison-card highlight">
                <h3>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                  OpenClaw
                </h3>
                <div className="comparison-total" style={{ marginTop: 0, paddingTop: 0, borderTop: "none" }}>
                  <span className="label">Time to deploy</span>
                  <span className="value">&lt;1 min</span>
                </div>
                <p className="comparison-description">Choose your model, pick a channel, and deploy. We handle infrastructure, keys, webhooks automatically.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="testimonials">
          <div className="container">
            <h2>What People Are Saying</h2>
            <div className="testimonials-grid">
              {testimonials.map((t) => (
                <div key={t.handle} className="testimonial-card">
                  <div className="tweet-header">
                    <div className="tweet-author">
                      <div className="testimonial-avatar">
                        <img src={`/profiles/${t.img}`} alt={t.name} />
                      </div>
                      <div className="tweet-author-info">
                        <h4>{t.name}</h4>
                        <span className="tweet-handle">{t.handle}</span>
                      </div>
                    </div>
                    <XIcon />
                  </div>
                  <p className="testimonial-quote">{t.quote}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="use-cases">
          <div className="container">
            <h2>What Can OpenClaw Do?</h2>
            <p>Automate virtually any task across communication, finance, shopping, and business operations.</p>
            <div className="use-cases-grid">
              {useCases.map((uc) => (
                <span key={uc} className="use-case-tag">{uc}</span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta">
          <div className="container">
            <h2>Start Deploying Now</h2>
            <p>Get your personal AI assistant running in under a minute.</p>
            <button onClick={() => trackAndSignIn("cta")} className="btn btn-primary">Get Started</button>
            <p className="hero-subtitle">Set up in under a minute. Cancel anytime. <a href="/money-back-guarantee" className="hero-guarantee-link">Moneyback guarantee</a>.</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <a href="#" className="logo">
              <CrabLogo id="logoGradient2" />
              OpenClaw
            </a>
            <div className="footer-links">
              <a href="/terms">Terms</a>
              <a href="/privacy">Privacy</a>
              <a href="/money-back-guarantee">Moneyback Guarantee</a>
            </div>
            <div className="footer-contact">
              <a href="mailto:support@tryopenclawai.com">support@tryopenclawai.com</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
