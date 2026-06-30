interface Props {
  total: number;
  completed: number;
  blockers: number;
  pending: number;
}

export function StatsBar({ total, completed, blockers, pending }: Props) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = [
    {
      label: "Team Members",
      value: total,
      icon: "👥",
      value_color: "text-slate-800",
      bg: "bg-white border-slate-200",
    },
    {
      label: "Submitted",
      value: completed,
      icon: "✅",
      value_color: "text-emerald-700",
      bg: "bg-emerald-50 border-emerald-200",
    },
    {
      label: "Pending",
      value: pending,
      icon: "⏳",
      value_color: "text-amber-700",
      bg: "bg-amber-50 border-amber-200",
    },
    {
      label: "Blockers",
      value: blockers,
      icon: "🚧",
      value_color: "text-red-700",
      bg: "bg-red-50 border-red-200",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label}
               className={`rounded-2xl border ${s.bg} px-5 py-4 shadow-sm`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {s.label}
              </span>
              <span className="text-base" aria-hidden="true">{s.icon}</span>
            </div>
            <p className={`text-3xl font-bold tracking-tight ${s.value_color}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Completion bar */}
      <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-sm font-semibold text-slate-700">
            Completion rate
          </span>
          <span className={`text-sm font-bold tabular-nums
            ${pct === 100 ? "text-emerald-600"
              : pct > 60   ? "text-indigo-600"
              : "text-amber-600"}`}>
            {pct}%
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden"
             role="progressbar" aria-valuenow={pct}
             aria-valuemin={0} aria-valuemax={100}
             aria-label={`${pct}% of standups submitted`}>
          <div className={`h-full rounded-full transition-all duration-700
            ${pct === 100 ? "bg-emerald-500"
              : pct > 60   ? "bg-indigo-500"
              : "bg-amber-400"}`}
               style={{ width: `${pct}%` }}/>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {completed} of {total} team members have submitted today
        </p>
      </div>
    </div>
  );
}
