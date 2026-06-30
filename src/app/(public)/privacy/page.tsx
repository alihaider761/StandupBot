/**
 * /privacy — Privacy Policy
 *
 * Required by Paddle for domain verification.
 * Update the placeholders marked with [BRACKETS] before going live.
 */

export const metadata = {
  title: "Privacy Policy – Standup Bot",
  description: "Privacy Policy for Standup Bot — how we collect, use, and protect your data.",
};

const LAST_UPDATED = "June 30, 2026";
const COMPANY = "Standup Bot";
const CONTACT_EMAIL = "privacy@example.com";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">

      {/* Header */}
      <div className="mb-12">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">
          Legal
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-snug">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 mt-3">
          Last updated: {LAST_UPDATED}
        </p>
      </div>

      <article className="space-y-10" aria-label="Privacy Policy">

        <Section title="1. Introduction">
          <p>
            {COMPANY} (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;)
            is committed to protecting your personal information and your right
            to privacy. This Privacy Policy explains how we collect, use,
            disclose, and safeguard your information when you use our Service.
          </p>
          <p>
            Please read this policy carefully. If you disagree with its terms,
            please stop using the Service.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>We collect information in the following ways:</p>
          <Subsection title="Information you provide">
            <ul>
              <li>Account registration data (name, email address, password)</li>
              <li>Standup update messages you send via Slack</li>
              <li>Billing information (processed and stored by Paddle — we never see your card number)</li>
            </ul>
          </Subsection>
          <Subsection title="Information from Slack">
            <ul>
              <li>Slack User IDs and workspace (team) IDs</li>
              <li>Direct message content sent to the bot</li>
              <li>User display names as provided by Slack</li>
            </ul>
          </Subsection>
          <Subsection title="Automatically collected data">
            <ul>
              <li>Log data (IP address, browser type, pages visited, timestamps)</li>
              <li>Usage analytics to improve the Service</li>
            </ul>
          </Subsection>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>We use the collected information to:</p>
          <ul>
            <li>Provide, operate, and maintain the Service</li>
            <li>Send daily standup prompts to team members via Slack</li>
            <li>Display standup reports on the team dashboard</li>
            <li>Process billing via Paddle</li>
            <li>Send administrative emails (account, billing, security)</li>
            <li>Improve and personalise the Service</li>
            <li>Comply with legal obligations</li>
          </ul>
        </Section>

        <Section title="4. Sharing Your Information">
          <p>
            We do not sell, trade, or rent your personal information to third
            parties. We may share data with:
          </p>
          <ul>
            <li>
              <strong className="text-gray-300">Paddle</strong> — for payment
              processing and subscription management
            </li>
            <li>
              <strong className="text-gray-300">Slack Technologies</strong> —
              to deliver bot messages to your workspace
            </li>
            <li>
              <strong className="text-gray-300">Infrastructure providers</strong>{" "}
              — hosting, database, and CDN services (e.g. Vercel, Supabase)
            </li>
            <li>
              Law enforcement or regulatory authorities when required by law
            </li>
          </ul>
        </Section>

        <Section title="5. Data Retention">
          <p>
            We retain standup reports and account data for as long as your
            account is active or as needed to provide the Service. You may
            request deletion of your data at any time by contacting us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-400 hover:underline">
              {CONTACT_EMAIL}
            </a>
            . We will process deletion requests within 30 days.
          </p>
        </Section>

        <Section title="6. Data Security">
          <p>
            We implement industry-standard security measures including:
          </p>
          <ul>
            <li>HTTPS encryption for all data in transit</li>
            <li>Bcrypt hashing for passwords</li>
            <li>Slack request signature verification for all webhook events</li>
            <li>Regular security reviews</li>
          </ul>
          <p>
            No system is completely secure. We cannot guarantee absolute
            security and encourage you to use strong, unique passwords.
          </p>
        </Section>

        <Section title="7. Cookies">
          <p>
            We use session cookies strictly necessary for authentication
            (NextAuth JWT). We do not use tracking or advertising cookies.
            You can configure your browser to refuse cookies, but this may
            affect your ability to log into the dashboard.
          </p>
        </Section>

        <Section title="8. Your Rights">
          <p>
            Depending on your location, you may have the right to:
          </p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data (&ldquo;right to be forgotten&rdquo;)</li>
            <li>Object to or restrict our processing of your data</li>
            <li>Data portability</li>
          </ul>
          <p>
            To exercise these rights, contact us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-400 hover:underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Section>

        <Section title="9. Third-Party Links">
          <p>
            The Service may contain links to third-party websites. We are not
            responsible for the privacy practices of those sites and encourage
            you to review their privacy policies.
          </p>
        </Section>

        <Section title="10. Children's Privacy">
          <p>
            The Service is not directed to individuals under the age of 16.
            We do not knowingly collect personal data from children. If you
            believe a child has provided us with personal data, please contact
            us and we will delete it promptly.
          </p>
        </Section>

        <Section title="11. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will
            notify you of material changes by email or by a notice within the
            Service. Your continued use after the changes take effect
            constitutes acceptance of the updated policy.
          </p>
        </Section>

        <Section title="12. Contact Us">
          <p>
            If you have questions or concerns about this Privacy Policy or our
            data practices, please contact us at:
          </p>
          <p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-indigo-400 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
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

function Subsection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pl-4 border-l-2 border-gray-800">
      <h3 className="text-sm font-medium text-gray-300 mb-1.5">{title}</h3>
      {children}
    </div>
  );
}
