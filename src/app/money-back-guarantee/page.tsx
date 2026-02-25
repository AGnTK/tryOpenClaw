import { LegalPageShell } from "@/components/legal-page-shell";

export default function MoneyBackGuaranteePage() {
  return (
    <LegalPageShell>
      <h1>Money-Back Guarantee</h1>
      <p className="legal-date">Last updated: February 9, 2026</p>

      <div className="legal-callout">
        <p className="legal-callout-title">Try OpenClaw risk-free for 7 days.</p>
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
    </LegalPageShell>
  );
}
