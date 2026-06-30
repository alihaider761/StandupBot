/**
 * Shared layout for public-facing pages:
 * /pricing, /terms, /privacy, /refunds
 *
 * Renders a minimal header + footer around the page content.
 */
import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      {/* ── Top navigation ──────────────────────────────────────────────── */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="Standup Bot home">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0
                            group-hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
              </svg>
            </div>
            <span className="font-bold text-sm text-slate-900">Standup Bot</span>
          </Link>

          <nav aria-label="Public navigation" className="flex items-center gap-1">
            <Link href="/pricing"
                  className="text-sm text-slate-600 hover:text-slate-900 px-3 py-1.5
                             rounded-lg hover:bg-slate-100 transition-colors font-medium">
              Pricing
            </Link>
            <Link href="/login"
                  className="text-sm text-white bg-indigo-600 hover:bg-indigo-700
                             px-4 py-1.5 rounded-lg transition-colors font-semibold shadow-sm">
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-200 bg-slate-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} Standup Bot. All rights reserved.
            </p>
            <nav aria-label="Footer links" className="flex flex-wrap justify-center gap-x-5 gap-y-1">
              {[
                { label: "Pricing", href: "/pricing" },
                { label: "Terms",   href: "/terms"   },
                { label: "Privacy", href: "/privacy" },
                { label: "Refunds", href: "/refunds" },
              ].map(l => (
                <Link key={l.href} href={l.href}
                      className="text-xs text-slate-500 hover:text-slate-800 transition-colors">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
