import type { ReportWithUser } from "@/types/report";

interface Props {
  report: ReportWithUser;
  highlight?: boolean;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    COMPLETE:    { label: "Complete",    cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    IN_PROGRESS: { label: "In Progress", cls: "bg-amber-100  text-amber-700  border-amber-200"  },
    PENDING:     { label: "Pending",     cls: "bg-slate-100  text-slate-500  border-slate-200"  },
    SKIPPED:     { label: "Skipped",     cls: "bg-slate-100  text-slate-400  border-slate-200"  },
  };
  const { label, cls } = map[status] ?? map.PENDING;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs
                      font-semibold border ${cls}`}>
      {label}
    </span>
  );
}

function Section({ emoji, label, content }: {
  emoji: string; label: string; content: string | null;
}) {
  if (!content) return null;
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
        {emoji} {label}
      </p>
      <p className="text-sm text-slate-700 leading-relaxed">{content}</p>
    </div>
  );
}

export function ReportCard({ report, highlight = false }: Props) {
  const initials =
    report.user.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "??";

  const base = "relative rounded-2xl border flex flex-col transition-all duration-200";
  const style = highlight
    ? `${base} bg-red-50 border-red-300 shadow-md blocker-glow`
    : `${base} bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300`;

  return (
    <article className={style}
             aria-label={`Standup report for ${report.user.name ?? "Unknown"}`}>

      {/* Blocker banner */}
      {highlight && (
        <div className="flex items-center gap-2 bg-red-600 text-white text-xs
                        font-bold px-4 py-1.5 rounded-t-2xl" role="alert">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0
                 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694
                 -1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          BLOCKER REPORTED — NEEDS ATTENTION
        </div>
      )}

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center
                            text-white text-xs font-bold shrink-0
                            ${highlight ? "bg-red-500" : "bg-indigo-600"}
                            shadow-sm`}
                 aria-hidden="true">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate leading-tight">
                {report.user.name ?? "Unknown User"}
              </p>
              {report.user.email && (
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {report.user.email}
                </p>
              )}
            </div>
          </div>
          <StatusBadge status={report.status}/>
        </div>

        {/* Content */}
        {report.status !== "PENDING" ? (
          <div className="space-y-3 flex-1">
            <Section emoji="✅" label="Yesterday" content={report.yesterday}/>
            <Section emoji="🎯" label="Today"     content={report.today}/>
            {report.roadblocks && report.roadblocks.toLowerCase() !== "none" && (
              <Section emoji="🚧" label="Blockers" content={report.roadblocks}/>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic flex-1">
            Awaiting response…
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3
                        border-t border-slate-100 mt-auto">
          <p className="text-[10px] text-slate-400">
            Updated{" "}
            {report.updatedAt.toLocaleTimeString("en-US", {
              hour: "2-digit", minute: "2-digit", timeZone: "UTC",
            })}{" "}UTC
          </p>
          {highlight && (
            <span className="text-[10px] font-bold text-red-600 bg-red-100
                             border border-red-200 px-2 py-0.5 rounded-full">
              ⚠ Action Required
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
