export function LegalPageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: legalStyles }} />
      <div className="legal-page">
        <nav className="legal-nav">
          <div className="legal-container legal-nav-inner">
            <a href="/" className="legal-logo">
              <svg className="legal-logo-icon" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="lLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#ff4d4d" }} />
                    <stop offset="100%" style={{ stopColor: "#991b1b" }} />
                  </linearGradient>
                </defs>
                <ellipse cx="50" cy="55" rx="35" ry="28" fill="url(#lLogoGrad)" />
                <ellipse cx="50" cy="45" rx="25" ry="18" fill="url(#lLogoGrad)" />
                <circle cx="38" cy="42" r="4" fill="#ffffff" />
                <circle cx="62" cy="42" r="4" fill="#ffffff" />
                <path d="M25 55 Q15 45 10 55 Q5 65 15 60 Q20 58 25 55" fill="url(#lLogoGrad)" />
                <path d="M75 55 Q85 45 90 55 Q95 65 85 60 Q80 58 75 55" fill="url(#lLogoGrad)" />
                <path d="M30 35 Q25 25 20 30 Q15 35 25 38" fill="url(#lLogoGrad)" />
                <path d="M70 35 Q75 25 80 30 Q85 35 75 38" fill="url(#lLogoGrad)" />
              </svg>
              OpenClaw
            </a>
            <a href="mailto:support@tryopenclawai.com" className="legal-nav-link">Contact Support</a>
          </div>
        </nav>

        <main className="legal-main">
          <div className="legal-container legal-content">
            {children}
          </div>
        </main>

        <footer className="legal-footer">
          <div className="legal-container legal-footer-inner">
            <div className="legal-footer-links">
              <a href="/terms">Terms</a>
              <a href="/privacy">Privacy</a>
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

const legalStyles = `
  .legal-page {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background-color: #ffffff;
    color: #050810;
    line-height: 1.7;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  .legal-page *, .legal-page *::before, .legal-page *::after {
    box-sizing: border-box;
  }
  .legal-container {
    max-width: 720px;
    margin: 0 auto;
    padding: 0 24px;
  }
  .legal-nav {
    border-bottom: 1px solid #f0f0f0;
    padding: 16px 0;
  }
  .legal-nav-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
  }
  .legal-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 18px;
    color: #050810;
    text-decoration: none;
  }
  .legal-logo-icon {
    width: 28px;
    height: 28px;
  }
  .legal-nav-link {
    font-size: 14px;
    color: #6b7280;
    text-decoration: none;
  }
  .legal-nav-link:hover {
    color: #111827;
  }
  .legal-main {
    flex: 1;
    padding: 64px 0 80px;
  }
  .legal-content h1 {
    font-size: 32px;
    font-weight: 700;
    line-height: 1.2;
    margin: 0 0 8px;
  }
  .legal-content .legal-date {
    font-size: 14px;
    color: #9ca3af;
    margin: 0 0 40px;
  }
  .legal-content h2 {
    font-size: 20px;
    font-weight: 600;
    margin: 40px 0 12px;
  }
  .legal-content h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 24px 0 8px;
  }
  .legal-content p {
    color: #4b5563;
    font-size: 15px;
    margin: 0 0 16px;
  }
  .legal-content ul,
  .legal-content ol {
    color: #4b5563;
    font-size: 15px;
    margin: 0 0 16px;
    padding-left: 24px;
  }
  .legal-content li {
    margin-bottom: 8px;
  }
  .legal-content a {
    color: #4b5563;
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .legal-content a:hover {
    color: #111827;
  }
  .legal-content .legal-callout {
    background: #f9fafb;
    border-left: 4px solid #e5e7eb;
    padding: 20px 24px;
    border-radius: 0 8px 8px 0;
    margin-bottom: 40px;
  }
  .legal-content .legal-callout p {
    margin: 0;
    color: #6b7280;
    font-size: 15px;
  }
  .legal-content .legal-callout-title {
    font-weight: 600;
    margin: 0 0 8px;
  }
  .legal-footer {
    border-top: 1px solid #f0f0f0;
    padding: 24px 0;
  }
  .legal-footer-inner {
    max-width: 1200px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
  }
  .legal-footer-links {
    display: flex;
    gap: 24px;
  }
  .legal-footer a {
    font-size: 13px;
    color: #9ca3af;
    text-decoration: none;
  }
  .legal-footer a:hover {
    color: #6b7280;
  }
  @media (max-width: 640px) {
    .legal-main { padding: 40px 0 60px; }
    .legal-content h1 { font-size: 26px; }
    .legal-content h2 { font-size: 18px; }
    .legal-content .legal-callout { padding: 16px 18px; }
    .legal-footer-inner { flex-direction: column; align-items: flex-start; }
  }
`;
