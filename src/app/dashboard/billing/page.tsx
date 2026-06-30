import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Billing – Standup Bot" };

const STATUS: Record<string, { label: string; cls: string }> = {
  active:   { label: "Active",        cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  inactive: { label: "Free Trial",    cls: "bg-slate-100  text-slate-600  border-slate-200"   },
  past_due: { label: "Past Due",      cls: "bg-amber-100  text-amber-700  border-amber-200"   },
  canceled: { label: "Canceled",      cls: "bg-red-100    text-red-700    border-red-200"     },
};

export default async function BillingPage() {
  const session = await auth();
  const orgId = (session!.user as { organizationId: string }).organizationId;

  const [org, seatCount] = await Promise.all([
    prisma.organization.findUnique({ where: { id: orgId } }),
    prisma.user.count({ where: { organizationId: orgId, isActive: true } }),
  ]);

  if (!org) return <p className="text-red-600 text-sm">Organization not found.</p>;

  const sk = org.subscriptionStatus ?? "inactive";
  const { label, cls } = STATUS[sk] ?? STATUS.inactive;

  return (
    <div className="max-w-2xl space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Billing</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your subscription and seat usage</p>
      </div>

      {/* Plan card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Per-Seat Plan</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Scales automatically with your active team
            </p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full
                            text-xs font-bold border ${cls}`}>
            {label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Active Seats",  value: seatCount,       sub: "from Slack workspace" },
            { label: "Billed Seats",  value: org.seatCount,   sub: "on current subscription" },
          ].map(c => (
            <div key={c.label}
                 className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase
                            tracking-wide mb-1">{c.label}</p>
              <p className="text-3xl font-bold text-slate-900">{c.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{c.sub}</p>
            </div>
          ))}
        </div>

        {org.billingCycleAnchor && (
          <p className="text-xs text-slate-500">
            Next renewal:{" "}
            {new Date(org.billingCycleAnchor).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        )}
      </div>

      {/* Paddle coming soon */}
      {sk !== "active" && (
        <div className="relative bg-white border border-indigo-200 rounded-2xl
                        shadow-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50
                          via-white to-white pointer-events-none" aria-hidden="true"/>
          <div className="relative p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200
                              flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3
                       3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Upgrade with Paddle</h3>
                <p className="text-xs text-indigo-600 font-medium mt-0.5">Launching soon</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              We&apos;re integrating <span className="font-semibold text-slate-800">Paddle</span> for
              globally compliant billing. Subscribe on a per-seat basis directly from this page.
            </p>

            <ul className="space-y-2">
              {[
                "Per-seat pricing — only pay for active members",
                "Automatic seat sync when your team changes",
                "Monthly billing · cancel anytime",
                "Local payment methods supported",
              ].map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <svg className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0"
                       fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            <button disabled aria-disabled="true"
                    className="flex items-center gap-2 bg-indigo-100 text-indigo-500
                               border border-indigo-200 font-semibold text-sm px-5 py-2.5
                               rounded-xl cursor-not-allowed">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2
                     2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              Subscribe · Coming Soon
            </button>
          </div>
        </div>
      )}

      {/* Legal links */}
      <div className="border-t border-slate-200 pt-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Legal
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          {[
            { href: "/pricing", label: "Pricing" },
            { href: "/terms",   label: "Terms of Service" },
            { href: "/privacy", label: "Privacy Policy" },
            { href: "/refunds", label: "Refund Policy" },
          ].map(l => (
            <Link key={l.href} href={l.href}
                  className="text-slate-500 hover:text-indigo-600 transition-colors font-medium">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
