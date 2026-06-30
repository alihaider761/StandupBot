/**
 * /refunds — Refund Policy
 *
 * Required by Paddle for domain verification.
 * Update the placeholders marked with [BRACKETS] before going live.
 */

export const metadata = {
  title: "Refund Policy – Standup Bot",
  description: "Refund Policy for Standup Bot subscriptions.",
};

const LAST_UPDATED = "June 30, 2026";
const COMPANY = "Standup Bot";
const CONTACT_EMAIL = "billing@example.com";
const RESPONSE_DAYS = 3;

export default function RefundsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">

      {/* Header */}
      <div className="mb-12">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">
          Legal
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-snug">
          Refund Policy
        </h1>
        <p className="text-sm text-gray-500 mt-3">
          Last updated: {LAST_UPDATED}
        </p>
      </div>

      <article className="space-y-10" aria-label="Refund Policy">

        <Section title="Overview">
          <p>
            We want you to be completely satisfied with {COMPANY}. This policy
            describes when and how refunds are handled for subscriptions
            purchased through our payment processor, Paddle.
          </p>
          <p>
            Because {COMPANY} is a subscription-based SaaS product, all sales
            are generally final. However, we handle each situation with
            fairness and common sense — the cases below outline our standard
            approach.
          </p>
        </Section>

        <Section title="Eligibility for a Refund">
          <p>You may be eligible for a refund in the following circumstances:</p>

          {/* Eligible cases */}
          <div className="space-y-4 mt-4">
            <EligibleCase
              emoji="✅"
              label="Within 7 days of initial subscription"
              description="If you subscribed and have not made significant use of the Service, you may request a full refund within 7 days of your first payment."
            />
            <EligibleCase
              emoji="✅"
              label="Duplicate charge"
              description="If you were accidentally charged more than once for the same subscription period, we will immediately refund the duplicate charge."
            />
            <EligibleCase
              emoji="✅"
              label="Technical failure on our end"
              description="If a verified outage or technical error on our part prevented you from using the Service for an extended period (more than 72 consecutive hours), you may request a pro-rated refund for the affected time."
            />
            <EligibleCase
              emoji="❌"
              label="Change of mind after 7 days"
              description="Refunds are not issued for change of mind after the 7-day window. You can cancel at any time and retain access until the end of your billing period."
            />
            <EligibleCase
              emoji="❌"
              label="Partial-month cancellation"
              description="We do not issue pro-rated refunds when you cancel mid-cycle. Your subscription remains active until the end of the paid period."
            />
            <EligibleCase
              emoji="❌"
              label="Unused seats"
              description="Refunds are not provided for seats that were provisioned but not actively used during a billing period."
            />
          </div>
        </Section>

        <Section title="How to Request a Refund">
          <p>
            To request a refund, email us at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-indigo-400 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>{" "}
            with the subject line{" "}
            <span className="text-gray-300 font-medium">
              &ldquo;Refund Request&rdquo;
            </span>{" "}
            and include:
          </p>
          <ul>
            <li>The email address associated with your account</li>
            <li>The date of the charge</li>
            <li>The reason for your request</li>
            <li>Any relevant screenshots or context</li>
          </ul>
          <p>
            We will respond within{" "}
            <strong className="text-gray-300">{RESPONSE_DAYS} business days</strong>.
          </p>
        </Section>

        <Section title="Processing Time">
          <p>
            Approved refunds are processed through Paddle and typically appear
            on your original payment method within 5–10 business days,
            depending on your bank or card issuer.
          </p>
        </Section>

        <Section title="Cancellation">
          <p>
            Cancelling your subscription is separate from requesting a refund.
            You can cancel at any time from the{" "}
            <a href="/dashboard/billing" className="text-indigo-400 hover:underline">
              Billing
            </a>{" "}
            page inside the dashboard. Cancellation stops future charges; it
            does not automatically trigger a refund for the current period.
          </p>
        </Section>

        <Section title="Paddle as Merchant of Record">
          <p>
            All transactions are processed by{" "}
            <strong className="text-gray-300">Paddle</strong> as the merchant
            of record. In some cases, refund requests may need to be handled
            directly with Paddle. We will guide you through this process if
            needed.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about this policy? Reach us at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-indigo-400 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Section>

      </article>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={title}>
      <h2 id={title} className="text-lg font-semibold text-white mb-3">
        {title}
      </h2>
      <div className="text-gray-400 text-sm leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}

function EligibleCase({
  emoji,
  label,
  description,
}: {
  emoji: string;
  label: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 bg-gray-900 border border-gray-800 rounded-xl p-4">
      <span className="text-base mt-0.5 shrink-0" aria-hidden="true">
        {emoji}
      </span>
      <div>
        <p className="text-sm font-medium text-gray-200">{label}</p>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}
