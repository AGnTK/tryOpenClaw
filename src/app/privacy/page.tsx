import { LegalPageShell } from "@/components/legal-page-shell";

export default function PrivacyPage() {
  return (
    <LegalPageShell>
      <h1>Privacy Policy</h1>
      <p className="legal-date">Last updated: February 9, 2026</p>

      <h2>1. Introduction</h2>
      <p>OpenClaw (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the OpenClaw platform available at <a href="https://tryopenclawai.com">tryopenclawai.com</a>. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service. Please read this policy carefully.</p>

      <h2>2. Information We Collect</h2>

      <h3>2.1 Information You Provide</h3>
      <ul>
        <li><strong>Account information:</strong> When you sign up via Google authentication, we receive your name, email address, and profile picture from your Google account.</li>
        <li><strong>Payment information:</strong> When you subscribe, payment details are collected and processed by Stripe. We do not store your full credit card number on our servers.</li>
        <li><strong>Bot configuration data:</strong> Settings, preferences, and configurations you apply to your deployed AI assistant instances.</li>
        <li><strong>Support communications:</strong> Any information you provide when contacting us for support.</li>
      </ul>

      <h3>2.2 Information Collected Automatically</h3>
      <ul>
        <li><strong>Usage data:</strong> Pages visited, features used, click patterns, and interactions with the Service.</li>
        <li><strong>Device information:</strong> Browser type, operating system, device type, and screen resolution.</li>
        <li><strong>Log data:</strong> IP address, access times, referring URLs, and error logs.</li>
        <li><strong>Cookies and tracking:</strong> We use cookies and similar technologies to maintain sessions, remember preferences, and analyze usage patterns.</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Provide, operate, and maintain the Service</li>
        <li>Process transactions and manage your subscription</li>
        <li>Deploy and manage your AI assistant instances</li>
        <li>Send you service-related communications (e.g., account confirmations, billing notices, security alerts)</li>
        <li>Send promotional emails about new features or offers (you may opt out at any time)</li>
        <li>Improve and personalize your experience with the Service</li>
        <li>Analyze usage trends to improve performance and features</li>
        <li>Detect, prevent, and address fraud, abuse, or technical issues</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>4. Third-Party Services</h2>
      <p>We share information with the following categories of third-party service providers:</p>
      <ul>
        <li><strong>Payment processing:</strong> Stripe processes your payment information securely.</li>
        <li><strong>AI providers:</strong> OpenAI, Anthropic, and Google process conversations through your deployed AI instances. Please review their respective privacy policies.</li>
        <li><strong>Analytics:</strong> We use PostHog and Google Analytics to understand how the Service is used.</li>
        <li><strong>Messaging platforms:</strong> Telegram and Discord facilitate communication between your AI instances and end users.</li>
        <li><strong>Email services:</strong> We use third-party email providers to send transactional and marketing emails.</li>
      </ul>
      <p>We do not sell your personal information to third parties.</p>

      <h2>5. Bot Conversations and AI Data</h2>
      <p>Messages sent to and from your deployed AI assistant instances are processed by third-party AI model providers. We may temporarily store conversation metadata (e.g., message counts, timestamps) for the purpose of providing the Service and tracking usage. We do not use the content of your bot conversations for training AI models or marketing purposes.</p>

      <h2>6. Data Retention</h2>
      <p>We retain your personal information for as long as your account is active or as needed to provide you the Service. If you delete your account, we will delete or anonymize your personal data within 30 days, except where we are required to retain data for legal or compliance purposes.</p>

      <h2>7. Data Security</h2>
      <p>We implement industry-standard security measures to protect your information, including encryption in transit (TLS/SSL), secure authentication, and access controls. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>

      <h2>8. Cookies</h2>
      <p>We use cookies for the following purposes:</p>
      <ul>
        <li><strong>Essential cookies:</strong> Required for the Service to function (authentication, session management).</li>
        <li><strong>Analytics cookies:</strong> Help us understand how visitors interact with the Service.</li>
        <li><strong>Advertising cookies:</strong> Used to deliver relevant ads and measure campaign effectiveness.</li>
      </ul>
      <p>You can manage cookie preferences through your browser settings. Disabling certain cookies may affect the functionality of the Service.</p>

      <h2>9. Your Rights</h2>
      <p>Depending on your jurisdiction, you may have the right to:</p>
      <ul>
        <li>Access the personal information we hold about you</li>
        <li>Request correction of inaccurate or incomplete data</li>
        <li>Request deletion of your personal data</li>
        <li>Object to or restrict processing of your data</li>
        <li>Request portability of your data in a machine-readable format</li>
        <li>Withdraw consent for data processing at any time</li>
        <li>Opt out of marketing communications</li>
      </ul>
      <p>To exercise any of these rights, please contact us at <a href="mailto:support@tryopenclawai.com">support@tryopenclawai.com</a>.</p>

      <h2>10. Children&apos;s Privacy</h2>
      <p>The Service is not intended for users under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected data from a child under 18, we will take steps to delete that information promptly.</p>

      <h2>11. International Data Transfers</h2>
      <p>Your information may be transferred to and processed in countries other than your country of residence. We take appropriate safeguards to ensure your data is protected in accordance with this Privacy Policy regardless of where it is processed.</p>

      <h2>12. Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date. We encourage you to review this policy periodically.</p>

      <h2>13. Contact Us</h2>
      <p>If you have any questions about this Privacy Policy or our data practices, please contact us at <a href="mailto:support@tryopenclawai.com">support@tryopenclawai.com</a>.</p>
    </LegalPageShell>
  );
}
