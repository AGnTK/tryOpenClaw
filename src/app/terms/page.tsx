import { LegalPageShell } from "@/components/legal-page-shell";

export default function TermsPage() {
  return (
    <LegalPageShell>
      <h1>Terms of Service</h1>
      <p className="legal-date">Last updated: February 9, 2026</p>

      <h2>1. Acceptance of Terms</h2>
      <p>By accessing or using the OpenClaw platform (&quot;Service&quot;) operated by OpenClaw (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), available at <a href="https://tryopenclawai.com">tryopenclawai.com</a>, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>

      <h2>2. Description of Service</h2>
      <p>OpenClaw provides a platform that allows users to deploy personal AI assistant instances on Telegram and Discord. The Service includes one-click deployment, infrastructure management, and ongoing hosting of AI bot instances powered by third-party AI models such as ChatGPT, Claude, and Gemini.</p>

      <h2>3. Eligibility</h2>
      <p>You must be at least 18 years of age to use the Service. By using the Service, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms.</p>

      <h2>4. Account Registration</h2>
      <p>To use the Service, you must create an account using Google authentication. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.</p>

      <h2>5. Subscriptions and Payments</h2>
      <ul>
        <li>The Service offers subscription-based plans. Pricing details are available on our website at the time of purchase.</li>
        <li>All payments are processed through Stripe. By subscribing, you agree to Stripe&apos;s terms of service.</li>
        <li>Subscriptions automatically renew at the end of each billing period unless cancelled prior to the renewal date.</li>
        <li>You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of the current billing period.</li>
        <li>We reserve the right to change pricing with reasonable notice. Continued use after a price change constitutes acceptance of the new pricing.</li>
      </ul>

      <h2>6. Money-Back Guarantee</h2>
      <p>We offer a 7-day money-back guarantee on all new subscriptions. If you are not satisfied with the Service, you may request a full refund within 7 days of your initial purchase. For full details, please see our <a href="/money-back-guarantee">Money-Back Guarantee Policy</a>.</p>

      <h2>7. Acceptable Use</h2>
      <p>You agree not to use the Service to:</p>
      <ul>
        <li>Violate any applicable laws, regulations, or third-party rights</li>
        <li>Send spam, unsolicited messages, or engage in abusive behavior through deployed bots</li>
        <li>Distribute malware, harmful code, or engage in phishing or social engineering</li>
        <li>Generate or distribute illegal, harmful, or explicitly prohibited content</li>
        <li>Attempt to gain unauthorized access to the Service or its infrastructure</li>
        <li>Resell or redistribute the Service without prior written consent</li>
        <li>Interfere with or disrupt the Service or impose an unreasonable load on our infrastructure</li>
      </ul>
      <p>We reserve the right to suspend or terminate your account for violation of these terms without prior notice or refund.</p>

      <h2>8. Third-Party AI Models</h2>
      <p>The Service integrates with third-party AI model providers (including OpenAI, Anthropic, and Google). Your use of AI-generated content is subject to the respective third-party provider&apos;s terms and policies. We do not guarantee the accuracy, reliability, or appropriateness of AI-generated outputs.</p>

      <h2>9. Intellectual Property</h2>
      <p>The Service, including its design, code, features, and branding, is the property of OpenClaw and is protected by intellectual property laws. You retain ownership of any content you create or submit through the Service. By using the Service, you grant us a limited license to host and process your content solely for the purpose of providing the Service.</p>

      <h2>10. Data and Privacy</h2>
      <p>Your use of the Service is also governed by our <a href="/privacy">Privacy Policy</a>, which describes how we collect, use, and protect your data.</p>

      <h2>11. Service Availability</h2>
      <p>We strive to maintain high uptime but do not guarantee uninterrupted access to the Service. We may perform maintenance, updates, or modifications that temporarily affect availability. We are not liable for any damages resulting from service interruptions.</p>

      <h2>12. Limitation of Liability</h2>
      <p>To the maximum extent permitted by law, OpenClaw and its affiliates, officers, directors, and employees shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of your use of or inability to use the Service.</p>
      <p>Our total liability to you for any claims arising from the Service shall not exceed the amount you paid to us in the 12 months preceding the claim.</p>

      <h2>13. Disclaimer of Warranties</h2>
      <p>The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>

      <h2>14. Indemnification</h2>
      <p>You agree to indemnify, defend, and hold harmless OpenClaw and its affiliates from any claims, damages, losses, or expenses (including reasonable attorney&apos;s fees) arising from your use of the Service or violation of these Terms.</p>

      <h2>15. Termination</h2>
      <p>We may suspend or terminate your access to the Service at any time, with or without cause, and with or without notice. Upon termination, your right to use the Service ceases immediately. Any provisions of these Terms that by their nature should survive termination shall survive.</p>

      <h2>16. Changes to Terms</h2>
      <p>We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on our website or by email. Your continued use of the Service after changes take effect constitutes your acceptance of the revised Terms.</p>

      <h2>17. Governing Law</h2>
      <p>These Terms shall be governed by and construed in accordance with applicable law, without regard to conflict of law principles.</p>

      <h2>18. Contact Us</h2>
      <p>If you have any questions about these Terms, please contact us at <a href="mailto:support@tryopenclawai.com">support@tryopenclawai.com</a>.</p>
    </LegalPageShell>
  );
}
