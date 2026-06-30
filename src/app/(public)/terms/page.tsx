/**
 * /terms — Terms of Service
 *
 * Required by Paddle for domain verification.
 * Fill in your company name, jurisdiction, and contact details below
 * before going live. The placeholders are marked with [BRACKETS].
 */

export const metadata = {
  title: "Terms of Service – Standup Bot",
  description: "Terms of Service for Standup Bot.",
};

const LAST_UPDATED = "June 30, 2026";
const COMPANY = "Standup Bot";
const CONTACT_EMAIL = "legal@example.com";
const JURISDICTION = "your jurisdiction";

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">

      {/* Header */}
      <div className="mb-12">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">
          Legal
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-snug">
          Terms of Service
        </h1>
        <p className="text-sm text-gray-500 mt-3">
          Last updated: {LAST_UPDATED}
        </p>
      </div>

      <article className="prose-custom space-y-10" aria-label="Terms of Service">

        <Section title="1. Acceptance of Terms">
          <p>
            By accessing or using {COMPANY} (&ldquo;the Service&rdquo;), you
            agree to be bound by these Terms of Service. If you do not agree,
            please do not use the Service.
          </p>
        </Section>

        <Section title="2. Description of Service">
          <p>
            {COMPANY} is an asynchronous daily standup bot that integrates with
            Slack workspaces. It collects standup updates from team members via
            direct messages and surfaces them in a web dashboard for project
            managers.
          </p>
        </Section>

        <Section title="3. Accounts and Registration">
          <p>
            You must provide accurate information when creating an account.
            You are responsible for maintaining the confidentiality of your
            credentials and for all activity that occurs under your account.
            Notify us immediately at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-400 hover:underline">
              {CONTACT_EMAIL}
            </a>{" "}
            if you suspect unauthorised access.
          </p>
        </Section>

        <Section title="4. Subscription and Payment">
          <p>
            {COMPANY} operates on a per-seat subscription model. Billing is
            handled by Paddle, our merchant of record. By subscribing, you
            agree to Paddle&apos;s Terms of Service in addition to these terms.
            Subscription fees are charged in advance on a monthly basis.
            Prices are subject to change with reasonable notice.
          </p>
        </Section>

        <Section title="5. Cancellation and Refunds">
          <p>
            You may cancel your subscription at any time. Access continues
            until the end of the current billing period. No refunds are issued
            for partial billing periods. For exceptional circumstances, please
            refer to our{" "}
            <a href="/refunds" className="text-indigo-400 hover:underline">
              Refund Policy
            </a>
            .
          </p>
        </Section>

        <Section title="6. Acceptable Use">
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any unlawful purpose</li>
            <li>Attempt to gain unauthorised access to the Service or its infrastructure</li>
            <li>Interfere with or disrupt the Service or its servers</li>
            <li>Resell or sublicense the Service without written permission</li>
            <li>Use the Service to transmit spam or malicious content</li>
          </ul>
        </Section>

        <Section title="7. Data and Privacy">
          <p>
            Your use of the Service is also governed by our{" "}
            <a href="/privacy" className="text-indigo-400 hover:underline">
              Privacy Policy
            </a>
            , which is incorporated into these Terms by reference.
          </p>
        </Section>

        <Section title="8. Intellectual Property">
          <p>
            All content, trademarks, and intellectual property associated with
            the Service are owned by or licensed to {COMPANY}. You may not
            reproduce, distribute, or create derivative works without prior
            written consent.
          </p>
        </Section>

        <Section title="9. Disclaimer of Warranties">
          <p>
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo; without warranties of any kind, express or implied,
            including but not limited to merchantability, fitness for a
            particular purpose, or non-infringement.
          </p>
        </Section>

        <Section title="10. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, {COMPANY} shall not be
            liable for any indirect, incidental, special, consequential, or
            punitive damages, or any loss of profits or data arising from your
            use of the Service.
          </p>
        </Section>

        <Section title="11. Governing Law">
          <p>
            These Terms shall be governed by and construed in accordance with
            the laws of {JURISDICTION}, without regard to its conflict of law
            principles.
          </p>
        </Section>

        <Section title="12. Changes to These Terms">
          <p>
            We reserve the right to modify these Terms at any time. We will
            provide reasonable notice of material changes by email or through
            the Service. Continued use of the Service after changes take effect
            constitutes your acceptance of the revised Terms.
          </p>
        </Section>

        <Section title="13. Contact">
          <p>
            If you have any questions about these Terms, please contact us at{" "}
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
      <h2
        id={title}
        className="text-lg font-semibold text-white mb-3"
      >
        {title}
      </h2>
      <div className="text-gray-400 text-sm leading-relaxed space-y-3 [&_a]:text-indigo-400 [&_a:hover]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
        {children}
      </div>
    </section>
  );
}
