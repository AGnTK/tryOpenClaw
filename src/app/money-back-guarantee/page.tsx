export default function MoneyBackGuaranteePage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: guaranteeStyles }} />
      <div className="guarantee-page">
        <nav className="guarantee-nav">
          <div className="guarantee-container">
            <a href="/" className="guarantee-logo">
              <svg className="guarantee-logo-icon" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="gLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#ff4d4d" }} />
                    <stop offset="100%" style={{ stopColor: "#991b1b" }} />
                  </linearGradient>
                </defs>
                <ellipse cx="50" cy="55" rx="35" ry="28" fill="url(#gLogoGrad)" />
                <ellipse cx="50" cy="45" rx="25" ry="18" fill="url(#gLogoGrad)" />
                <circle cx="38" cy="42" r="4" fill="#ffffff" />
                <circle cx="62" cy="42" r="4" fill="#ffffff" />
                <path d="M25 55 Q15 45 10 55 Q5 65 15 60 Q20 58 25 55" fill="url(#gLogoGrad)" />
                <path d="M75 55 Q85 45 90 55 Q95 65 85 60 Q80 58 75 55" fill="url(#gLogoGrad)" />
                <path d="M30 35 Q25 25 20 30 Q15 35 25 38" fill="url(#gLogoGrad)" />
                <path d="M70 35 Q75 25 80 30 Q85 35 75 38" fill="url(#gLogoGrad)" />
              </svg>
              OpenClaw
            </a>
            <a href="mailto:support@tryopenclawai.com" className="guarantee-nav-link">Contact Support</a>
          </div>
        </nav>

        <main className="guarantee-main">
          <div className="guarantee-container guarantee-content">
            <h1>Money-Back Guarantee</h1>
            <p className="guarantee-date">Last updated: February 9, 2026</p>

            <div className="guarantee-callout">
              <p className="guarantee-callout-title">Try OpenClaw risk-free for 7 days.</p>
              <p>If you&apos;re not completely satisfied with OpenClaw, contact us within 7 days of your initial purchase for a full refund. No questions asked.</p>
            </div>

            <h2>Our Promise</h2>
            <p>We believe in the value OpenClaw provides. That&apos;s why we offer a straightforward 7-day money-back guarantee on all new subscriptions. If our Service doesn&apos;t meet your expectations, we&apos;ll give you a full refund — it&apos;s that simple.</p>

            <h2>Eligibility</h2>
            <p>The money-back guarantee applies when:</p>
            <ul>
              <li>You are within <strong>7 days</strong> of your initial subscription purchase date</li>
              <li>It is your <strong>first</strong> subscription with OpenClaw (the guarantee does not apply to renewals or re-subscriptions)</li>
              <li>You submit your refund request via email to <a href="mailto:support@tryopenclawai.com">support@tryopenclawai.com</a></li>
            </ul>

            <h2>How to Request a Refund</h2>
            <ol>
              <li>Send an email to <a href="mailto:support@tryopenclawai.com">support@tryopenclawai.com</a> with the subject line &quot;Refund Request&quot;</li>
              <li>Include the email address associated with your OpenClaw account</li>
              <li>We will process your refund within 5-10 business days</li>
            </ol>
            <p>You do not need to provide a reason for your refund request during the 7-day guarantee period.</p>

            <h2>What Happens After a Refund</h2>
            <ul>
              <li>Your subscription will be cancelled immediately upon refund processing</li>
              <li>All deployed AI assistant instances associated with your account will be deactivated</li>
              <li>The refund will be issued to your original payment method via Stripe</li>
              <li>You are welcome to re-subscribe at any time, though the money-back guarantee applies only to your first subscription</li>
            </ul>

            <h2>Exclusions</h2>
            <p>The money-back guarantee does not apply to:</p>
            <ul>
              <li>Subscription renewals (monthly or annual recurring charges)</li>
              <li>Accounts that have been terminated for violating our Terms of Service</li>
              <li>Requests made after the 7-day guarantee period has expired</li>
              <li>Re-subscriptions by users who have previously received a refund</li>
            </ul>

            <h2>Refunds Outside the Guarantee Period</h2>
            <p>If you are outside the 7-day guarantee period but believe you have a valid reason for a refund (e.g., extended service outage, billing error), please contact us at <a href="mailto:support@tryopenclawai.com">support@tryopenclawai.com</a>. We review these requests on a case-by-case basis and are committed to treating all customers fairly.</p>

            <h2>Contact Us</h2>
            <p>Have questions about our refund policy? Reach out to us anytime at <a href="mailto:support@tryopenclawai.com">support@tryopenclawai.com</a>.</p>
          </div>
        </main>

        <footer className="guarantee-footer">
          <div className="guarantee-container guarantee-footer-inner">
            <div className="guarantee-footer-links">
              <a href="#">Terms</a>
              <a href="#">Privacy</a>
              <a href="/money-back-guarantee">Money-Back Guarantee</a>
            </div>
            <div>
              <a href="mailto:support@tryopenclawai.com">support@tryopenclawai.com</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

const guaranteeStyles = `
  .guarantee-page {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background-color: #ffffff;
    color: #050810;
    line-height: 1.7;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  .guarantee-page *, .guarantee-page *::before, .guarantee-page *::after {
    box-sizing: border-box;
  }
  .guarantee-container {
    max-width: 720px;
    margin: 0 auto;
    padding: 0 24px;
  }

  /* Nav */
  .guarantee-nav {
    border-bottom: 1px solid #f0f0f0;
    padding: 16px 0;
  }
  .guarantee-nav .guarantee-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
  }
  .guarantee-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 18px;
    color: #050810;
    text-decoration: none;
  }
  .guarantee-logo-icon {
    width: 28px;
    height: 28px;
  }
  .guarantee-nav-link {
    font-size: 14px;
    color: #6b7280;
    text-decoration: none;
  }
  .guarantee-nav-link:hover {
    color: #111827;
  }

  /* Main content */
  .guarantee-main {
    flex: 1;
    padding: 64px 0 80px;
  }
  .guarantee-content h1 {
    font-size: 32px;
    font-weight: 700;
    line-height: 1.2;
    margin: 0 0 8px;
  }
  .guarantee-date {
    font-size: 14px;
    color: #9ca3af;
    margin: 0 0 40px;
  }
  .guarantee-callout {
    background: #f9fafb;
    border-left: 4px solid #e5e7eb;
    padding: 20px 24px;
    border-radius: 0 8px 8px 0;
    margin-bottom: 40px;
  }
  .guarantee-callout-title {
    font-weight: 600;
    margin: 0 0 8px;
  }
  .guarantee-callout p {
    margin: 0;
    color: #6b7280;
    font-size: 15px;
  }
  .guarantee-content h2 {
    font-size: 20px;
    font-weight: 600;
    margin: 40px 0 12px;
  }
  .guarantee-content p {
    color: #4b5563;
    font-size: 15px;
    margin: 0 0 16px;
  }
  .guarantee-content ul,
  .guarantee-content ol {
    color: #4b5563;
    font-size: 15px;
    margin: 0 0 16px;
    padding-left: 24px;
  }
  .guarantee-content li {
    margin-bottom: 8px;
  }
  .guarantee-content a {
    color: #4b5563;
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .guarantee-content a:hover {
    color: #111827;
  }

  /* Footer */
  .guarantee-footer {
    border-top: 1px solid #f0f0f0;
    padding: 24px 0;
  }
  .guarantee-footer-inner {
    max-width: 1200px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
  }
  .guarantee-footer-links {
    display: flex;
    gap: 24px;
  }
  .guarantee-footer a {
    font-size: 13px;
    color: #9ca3af;
    text-decoration: none;
  }
  .guarantee-footer a:hover {
    color: #6b7280;
  }

  @media (max-width: 640px) {
    .guarantee-main { padding: 40px 0 60px; }
    .guarantee-content h1 { font-size: 26px; }
    .guarantee-content h2 { font-size: 18px; }
    .guarantee-callout { padding: 16px 18px; }
    .guarantee-footer-inner { flex-direction: column; align-items: flex-start; }
  }
`;
