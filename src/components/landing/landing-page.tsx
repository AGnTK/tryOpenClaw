"use client";

import { createSupabaseBrowser } from "@/lib/supabase-client";

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
  return (
    <>
      <style jsx global>{landingStyles}</style>

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
            <div className="nav-links">
              <a href="mailto:support@openclaw.new">Contact Support</a>
              <button onClick={signInWithGoogle} className="btn btn-primary">Get Started</button>
            </div>
          </div>
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

            <button onClick={signInWithGoogle} className="btn btn-primary">Get Started</button>
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
            <button onClick={signInWithGoogle} className="btn btn-primary">Get Started</button>
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
              <a href="#">Terms</a>
              <a href="#">Privacy</a>
              <a href="#">Moneyback Guarantee</a>
            </div>
            <div className="footer-contact">
              <a href="mailto:support@openclaw.new">support@openclaw.new</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

/* ── All CSS from the original index.html, scoped under .landing-page ── */
const landingStyles = `
  .landing-page {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background-color: #ffffff;
    color: #050810;
    line-height: 1.6;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0);
    background-size: 24px 24px;
  }

  .landing-page *, .landing-page *::before, .landing-page *::after {
    box-sizing: border-box;
  }

  .landing-page .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }

  /* Announcement Banner */
  .landing-page .announcement-banner {
    background: linear-gradient(90deg, rgba(239,68,68,0.08) 0%, rgba(13,148,136,0.08) 100%);
    border-bottom: 1px solid rgba(0,0,0,0.06);
    padding: 12px 16px;
    text-align: center;
  }
  .landing-page .announcement-banner p {
    font-size: 14px;
    color: #4b5563;
    margin: 0;
  }
  .landing-page .announcement-banner span {
    color: #0d9488;
    font-weight: 600;
  }

  /* Navigation */
  .landing-page .navbar {
    padding: 16px 0;
    border-bottom: 1px solid rgba(0,0,0,0.06);
    position: sticky;
    top: 0;
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(10px);
    z-index: 100;
  }
  .landing-page .navbar .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .landing-page .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: #050810;
    font-weight: 700;
    font-size: 18px;
  }
  .landing-page .logo-icon {
    width: 32px;
    height: 32px;
  }
  .landing-page .nav-links {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .landing-page .nav-links > a:first-child {
    display: inline;
  }
  .landing-page .nav-links a {
    color: #4b5563;
    text-decoration: none;
    font-size: 14px;
    transition: color 0.2s;
  }
  .landing-page .nav-links a:hover {
    color: #050810;
  }

  /* Buttons */
  .landing-page .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s;
    cursor: pointer;
    border: none;
  }
  .landing-page .btn-primary {
    background: #dc2626;
    color: #ffffff !important;
  }
  .landing-page .btn-primary:hover {
    background: #b91c1c;
    transform: translateY(-1px);
  }

  /* Hero Section */
  .landing-page .hero {
    padding: 80px 0 60px;
    text-align: center;
  }
  .landing-page .hero h1 {
    font-size: clamp(32px, 8vw, 64px);
    font-weight: 700;
    line-height: 1.1;
    margin-bottom: 20px;
    letter-spacing: -0.02em;
  }
  .landing-page .hero h1 span {
    background: linear-gradient(135deg, #ff4d4d 0%, #991b1b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .landing-page .hero p {
    font-size: 16px;
    color: #4b5563;
    max-width: 540px;
    margin: 0 auto 32px;
    line-height: 1.7;
  }
  .landing-page .hero .btn {
    padding: 14px 28px;
    font-size: 15px;
  }
  .landing-page .hero-logos-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin-bottom: 32px;
    flex-wrap: wrap;
  }
  .landing-page .hero-logos-label {
    font-size: 13px;
    color: #9ca3af;
    font-weight: 500;
  }
  .landing-page .hero-logo {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #4b5563;
    font-size: 14px;
    font-weight: 500;
    transition: opacity 0.2s;
  }
  .landing-page .hero-logo:hover { opacity: 0.7; }
  .landing-page .hero-logo img {
    height: 18px;
    width: auto;
  }
  .landing-page .logo-spacer { width: 40px; }

  /* Social Proof */
  .landing-page .social-proof {
    padding: 48px 0;
    border-top: 1px solid rgba(0,0,0,0.06);
    border-bottom: 1px solid rgba(0,0,0,0.06);
    background: #f9fafb;
  }
  .landing-page .social-proof-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #9ca3af;
    text-align: center;
    margin-bottom: 24px;
  }
  .landing-page .company-logos {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 32px;
    flex-wrap: wrap;
  }
  .landing-page .company-logo {
    display: flex;
    align-items: center;
    opacity: 0.4;
    transition: opacity 0.2s;
    filter: grayscale(100%);
  }
  .landing-page .company-logo:hover {
    opacity: 0.7;
    filter: grayscale(0%);
  }
  .landing-page .company-logo img {
    height: 22px;
    width: auto;
  }

  /* Comparison Section */
  .landing-page .comparison { padding: 80px 0; }
  .landing-page .comparison h2 {
    text-align: center;
    font-size: 32px;
    margin-bottom: 48px;
    font-weight: 700;
  }
  .landing-page .comparison-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  .landing-page .comparison-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 28px;
  }
  .landing-page .comparison-card.highlight {
    border-color: #0d9488;
    box-shadow: 0 4px 24px rgba(13,148,136,0.12);
  }
  .landing-page .comparison-card h3 {
    font-size: 18px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
  }
  .landing-page .comparison-card.highlight h3 { color: #0d9488; }
  .landing-page .comparison-item {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid rgba(0,0,0,0.06);
    font-size: 14px;
  }
  .landing-page .comparison-item:last-child { border-bottom: none; }
  .landing-page .comparison-item .label { color: #4b5563; }
  .landing-page .comparison-item .value {
    font-family: 'JetBrains Mono', monospace;
    color: #9ca3af;
    font-size: 13px;
  }
  .landing-page .comparison-total {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 2px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    font-size: 16px;
    font-weight: 600;
  }
  .landing-page .comparison-total .value {
    font-family: 'JetBrains Mono', monospace;
  }
  .landing-page .comparison-card.highlight .comparison-total .value {
    color: #0d9488;
    font-size: 22px;
  }
  .landing-page .comparison-note {
    margin-top: 14px;
    font-size: 12px;
    color: #9ca3af;
    font-style: italic;
  }
  .landing-page .comparison-description {
    margin-top: 14px;
    font-size: 14px;
    color: #4b5563;
    line-height: 1.6;
  }

  /* Testimonials */
  .landing-page .testimonials {
    padding: 80px 0;
    background: #f9fafb;
  }
  .landing-page .testimonials h2 {
    text-align: center;
    font-size: 32px;
    margin-bottom: 48px;
    font-weight: 700;
  }
  .landing-page .testimonials-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  .landing-page .testimonial-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 16px;
    transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  }
  .landing-page .testimonial-card:hover {
    border-color: #d1d5db;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  }
  .landing-page .tweet-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .landing-page .tweet-author {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .landing-page .testimonial-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ff4d4d 0%, #991b1b 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
    color: white;
    overflow: hidden;
  }
  .landing-page .testimonial-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    flex-shrink: 0;
  }
  .landing-page .tweet-author-info {
    display: flex;
    flex-direction: column;
  }
  .landing-page .tweet-author-info h4 {
    font-size: 14px;
    font-weight: 600;
    color: #050810;
    line-height: 1.2;
  }
  .landing-page .tweet-handle {
    font-size: 13px;
    color: #9ca3af;
    line-height: 1.2;
  }
  .landing-page .tweet-icon {
    color: #9ca3af;
    flex-shrink: 0;
  }
  .landing-page .tweet-icon svg {
    width: 18px;
    height: 18px;
  }
  .landing-page .testimonial-quote {
    font-size: 15px;
    line-height: 1.5;
    color: #050810;
    margin: 0;
  }

  /* Use Cases */
  .landing-page .use-cases { padding: 80px 0; }
  .landing-page .use-cases h2 {
    text-align: center;
    font-size: 32px;
    margin-bottom: 16px;
    font-weight: 700;
  }
  .landing-page .use-cases > .container > p {
    text-align: center;
    color: #4b5563;
    max-width: 540px;
    margin: 0 auto 48px;
    font-size: 15px;
  }
  .landing-page .use-cases-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }
  .landing-page .use-case-tag {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 100px;
    padding: 8px 16px;
    font-size: 13px;
    color: #4b5563;
    transition: all 0.2s;
  }
  .landing-page .use-case-tag:hover {
    border-color: #0d9488;
    color: #050810;
    background: #ffffff;
  }

  /* CTA Section */
  .landing-page .cta {
    padding: 100px 0;
    background: #f9fafb;
    text-align: center;
  }
  .landing-page .cta h2 {
    font-size: clamp(28px, 6vw, 42px);
    margin-bottom: 20px;
    font-weight: 700;
  }
  .landing-page .cta p {
    color: #4b5563;
    font-size: 16px;
    margin-bottom: 32px;
  }
  .landing-page .cta .btn {
    padding: 14px 32px;
    font-size: 16px;
  }

  /* Footer */
  .landing-page .footer {
    padding: 32px 0;
    border-top: 1px solid rgba(0,0,0,0.06);
  }
  .landing-page .footer .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
  }
  .landing-page .footer-links {
    display: flex;
    gap: 24px;
  }
  .landing-page .footer-links a {
    color: #9ca3af;
    text-decoration: none;
    font-size: 13px;
    transition: color 0.2s;
  }
  .landing-page .footer-links a:hover { color: #4b5563; }
  .landing-page .footer-contact { font-size: 13px; color: #9ca3af; }
  .landing-page .footer-contact a { color: #4b5563; text-decoration: none; }

  /* Animations */
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .landing-page .hero h1,
  .landing-page .hero p,
  .landing-page .hero .btn {
    animation: fadeInUp 0.6s ease-out forwards;
  }
  .landing-page .hero p { animation-delay: 0.1s; }
  .landing-page .hero .btn { animation-delay: 0.2s; }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .landing-page .container { padding: 0 20px; }
    .landing-page .announcement-banner p { font-size: 13px; }
    .landing-page .navbar { padding: 14px 0; }
    .landing-page .logo { font-size: 16px; }
    .landing-page .logo-icon { width: 28px; height: 28px; }
    .landing-page .btn { padding: 10px 18px; font-size: 13px; }
    .landing-page .hero { padding: 60px 0 48px; }
    .landing-page .hero h1 { font-size: 36px; margin-bottom: 16px; }
    .landing-page .hero p { font-size: 15px; margin-bottom: 28px; padding: 0 10px; }
    .landing-page .social-proof { padding: 40px 0; }
    .landing-page .company-logos { gap: 24px; }
    .landing-page .comparison { padding: 60px 0; }
    .landing-page .comparison h2 { font-size: 28px; margin-bottom: 36px; }
    .landing-page .comparison-grid { grid-template-columns: 1fr; gap: 20px; }
    .landing-page .comparison-card { padding: 24px; }
    .landing-page .testimonials { padding: 60px 0; }
    .landing-page .testimonials h2 { font-size: 28px; margin-bottom: 36px; }
    .landing-page .testimonials-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
    .landing-page .testimonial-card { padding: 14px; }
    .landing-page .testimonial-avatar { width: 36px; height: 36px; font-size: 13px; }
    .landing-page .tweet-author-info h4 { font-size: 13px; }
    .landing-page .tweet-handle { font-size: 12px; }
    .landing-page .testimonial-quote { font-size: 14px; }
    .landing-page .use-cases { padding: 60px 0; }
    .landing-page .use-cases h2 { font-size: 28px; }
    .landing-page .use-cases > .container > p { font-size: 14px; margin-bottom: 36px; }
    .landing-page .use-case-tag { padding: 8px 14px; font-size: 12px; }
    .landing-page .cta { padding: 80px 0; }
    .landing-page .cta h2 { font-size: 32px; }
    .landing-page .footer .container { flex-direction: column; text-align: center; gap: 16px; }
    .landing-page .footer-links { gap: 20px; }
  }

  @media (max-width: 480px) {
    .landing-page .desktop-break { display: none; }
    .landing-page .container { padding: 0 16px; }
    .landing-page .announcement-banner { padding: 10px 12px; }
    .landing-page .announcement-banner p { font-size: 12px; }
    .landing-page .navbar { padding: 12px 0; }
    .landing-page .logo { font-size: 15px; gap: 8px; }
    .landing-page .logo-icon { width: 26px; height: 26px; }
    .landing-page .nav-links { gap: 12px; }
    .landing-page .nav-links > a:first-child { display: none; }
    .landing-page .btn { padding: 12px 20px; font-size: 14px; border-radius: 6px; min-height: 44px; }
    .landing-page .hero { padding: 48px 0 40px; }
    .landing-page .hero h1 { font-size: 28px; line-height: 1.15; margin-bottom: 14px; }
    .landing-page .hero h1 br { display: none; }
    .landing-page .hero p { font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
    .landing-page .hero .btn { padding: 14px 24px; font-size: 14px; width: 100%; max-width: 280px; min-height: 48px; }
    .landing-page .hero-logos-row { gap: 16px; }
    .landing-page .hero-logo { font-size: 13px; gap: 6px; }
    .landing-page .social-proof { padding: 32px 0; }
    .landing-page .company-logos { gap: 16px 20px; }
    .landing-page .comparison { padding: 48px 0; }
    .landing-page .comparison h2 { font-size: 24px; margin-bottom: 28px; }
    .landing-page .comparison-card { padding: 20px; border-radius: 12px; }
    .landing-page .comparison-card h3 { font-size: 16px; margin-bottom: 16px; }
    .landing-page .comparison-item { padding: 8px 0; font-size: 13px; }
    .landing-page .comparison-item .value { font-size: 12px; }
    .landing-page .comparison-total { margin-top: 16px; padding-top: 16px; font-size: 15px; }
    .landing-page .comparison-card.highlight .comparison-total .value { font-size: 20px; }
    .landing-page .comparison-note { font-size: 11px; }
    .landing-page .comparison-description { font-size: 13px; }
    .landing-page .testimonials { padding: 48px 0; }
    .landing-page .testimonials h2 { font-size: 24px; margin-bottom: 28px; }
    .landing-page .testimonials-grid { grid-template-columns: 1fr; gap: 12px; }
    .landing-page .testimonial-card { padding: 14px; }
    .landing-page .tweet-header { margin-bottom: 10px; }
    .landing-page .testimonial-avatar { width: 32px; height: 32px; font-size: 12px; }
    .landing-page .tweet-author-info h4 { font-size: 13px; }
    .landing-page .tweet-handle { font-size: 11px; }
    .landing-page .tweet-icon svg { width: 16px; height: 16px; }
    .landing-page .testimonial-quote { font-size: 13px; }
    .landing-page .use-cases { padding: 48px 0; }
    .landing-page .use-cases h2 { font-size: 24px; margin-bottom: 12px; }
    .landing-page .use-cases > .container > p { font-size: 13px; margin-bottom: 28px; }
    .landing-page .use-cases-grid { gap: 6px; }
    .landing-page .use-case-tag { padding: 6px 12px; font-size: 11px; }
    .landing-page .cta { padding: 60px 0; }
    .landing-page .cta h2 { font-size: 26px; margin-bottom: 14px; }
    .landing-page .cta p { font-size: 14px; margin-bottom: 24px; }
    .landing-page .cta .btn { padding: 14px 28px; font-size: 14px; width: 100%; max-width: 280px; min-height: 48px; }
    .landing-page .footer { padding: 24px 0; }
    .landing-page .footer .logo { font-size: 14px; }
    .landing-page .footer-links { gap: 16px; flex-wrap: wrap; justify-content: center; }
    .landing-page .footer-links a { font-size: 12px; }
    .landing-page .footer-contact { font-size: 12px; }
  }

  @media (max-width: 360px) {
    .landing-page .hero h1 { font-size: 24px; }
    .landing-page .comparison-item { flex-direction: column; gap: 4px; }
    .landing-page .comparison-item .value { text-align: left; }
    .landing-page .company-logos { gap: 12px 16px; }
  }
`;
