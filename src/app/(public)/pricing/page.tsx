/**
 * /pricing — Public pricing page.
 *
 * Required by Paddle for domain verification.
 * Shows the per-seat plan clearly. Paddle checkout will be wired up later.
 */
import Link from "next/link";

export const metadata = {
  title: "Pricing – Standup Bot",
  description:
    "Simple, transparent per-seat pricing for async daily standups. Only pay for active team members.",
};

const FEATURES = [
  "Unlimited daily standup messages",
  "Automatic blocker detection & alerts",
  "Team dashboard with calendar history",
  "Slack DM-based async workflow",
  "Per-seat billing — scales with your team",
  "Priority email support",
];

const FAQ = [
  {
    q: "What counts as a seat?",
    a: "A seat is any active Slack workspace member who receives the daily standup prompt. You can mark members as inactive at any time to stop billing for them.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes — you can use Standup Bot free during our early-access period. Billing will activate once Paddle payments go live. You will be notified in advance.",
  },
  {
    q: "What payment methods are supported?",
    a: "We use Paddle as our payment processor, which supports credit/debit cards and many local payment methods worldwide.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. You can cancel your subscription at any time. Your team keeps access until the end of the current billing period.",
  },
  {
    q: "Do you offer annual billing?",
    a: "Annual billing with a discount is planned. It will be available when Paddle integration goes live.",
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-24">

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="text-center space-y-5" aria-labelledby="pricing-hero">
        <h1
          id="pricing-hero"
          className="text-4xl sm:text-5xl font-bold text-white leading-tight"
        >
          Simple pricing,{" "}
          <span className="text-indigo-400">no surprises</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-xl mx-auto">
          One plan. Per-seat pricing that scales with your team. Only pay for
          members who are actively using Standup Bot.
        </p>
      </section>

      {/* ── Pricing card ────────────────────────────────────────────────── */}
      <section aria-labelledby="plan-heading" className="flex justify-center">
        <div className="relative w-full max-w-sm">
          {/* Popular badge */}
          <div
            className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white
                        text-xs font-bold px-4 py-1 rounded-full tracking-wide"
          >
            PER SEAT
          </div>

          <div className="bg-gray-900 border border-indigo-500/40 rounded-2xl p-8 shadow-2xl space-y-6">
            <div>
              <h2
                id="plan-heading"
                className="text-lg font-semibold text-white"
              >
                Team Plan
              </h2>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-4xl font-bold text-white">$3</span>
                <span className="text-gray-400 mb-1">/seat /month</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Billed monthly · cancel anytime
              </p>
            </div>

            {/* Feature list */}
            <ul className="space-y-3" aria-label="Plan features">
              {FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-3 text-sm text-gray-300"
                >
                  <svg
                    className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA — disabled until Paddle is live */}
            <div className="space-y-3">
              <button
                disabled
                aria-disabled="true"
                className="w-full bg-indigo-600/50 text-indigo-300 border border-indigo-500/40
                           font-semibold text-sm py-3 rounded-xl cursor-not-allowed
                           flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Get Started — Coming Soon
              </button>
              <p className="text-center text-xs text-gray-600">
                Payments via{" "}
                <span className="text-gray-500 font-medium">Paddle</span> ·
                launching soon
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Billing note ────────────────────────────────────────────────── */}
      <section
        className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex gap-4"
        aria-label="Billing transparency note"
      >
        <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-900/30 border border-amber-700/30
                        flex items-center justify-center">
          <svg
            className="w-5 h-5 text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white mb-1">
            Automatic seat synchronisation
          </h3>
          <p className="text-sm text-gray-400">
            Your billed seat count is synced from your active Slack workspace
            members each billing cycle. Add or remove members and your invoice
            adjusts automatically — no manual upgrades required.
          </p>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section aria-labelledby="faq-heading">
        <h2
          id="faq-heading"
          className="text-2xl font-bold text-white mb-8 text-center"
        >
          Frequently asked questions
        </h2>
        <dl className="space-y-6 max-w-2xl mx-auto">
          {FAQ.map(({ q, a }) => (
            <div
              key={q}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5"
            >
              <dt className="text-sm font-semibold text-white mb-2">{q}</dt>
              <dd className="text-sm text-gray-400 leading-relaxed">{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── Bottom CTA ──────────────────────────────────────────────────── */}
      <section className="text-center space-y-4" aria-labelledby="cta-heading">
        <h2
          id="cta-heading"
          className="text-2xl font-bold text-white"
        >
          Ready to streamline your standups?
        </h2>
        <p className="text-gray-400 text-sm">
          Sign in now and start your free early-access period.
        </p>
        <Link
          href="/login"
          className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-semibold
                     text-sm px-6 py-3 rounded-xl transition-colors"
        >
          Sign in free →
        </Link>
      </section>

    </div>
  );
}
