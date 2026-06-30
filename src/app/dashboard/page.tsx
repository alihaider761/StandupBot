import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReportCard } from "@/components/ReportCard";
import { StatsBar } from "@/components/StatsBar";
import type { ReportWithUser } from "@/types/report";

export const metadata = { title: "Today's Standups – Standup Bot" };
export const revalidate = 60;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const session = await auth();
  const orgId = (session!.user as { organizationId: string }).organizationId;

  const params = await searchParams;
  let targetDate = new Date();
  if (params.date) {
    const d = new Date(params.date);
    if (!isNaN(d.getTime())) targetDate = d;
  }
  targetDate.setUTCHours(0, 0, 0, 0);

  const isToday =
    targetDate.toISOString().slice(0, 10) ===
    new Date().toISOString().slice(0, 10);

  const [reports, totalActiveUsers] = await Promise.all([
    prisma.standupReport.findMany({
      where: { organizationId: orgId, reportDate: targetDate },
      include: {
        user: { select: { id: true, name: true, email: true, slackUserId: true } },
      },
      orderBy: [{ hasBlocker: "desc" }, { user: { name: "asc" } }],
    }),
    prisma.user.count({ where: { organizationId: orgId, isActive: true } }),
  ]);

  const typed      = reports as ReportWithUser[];
  const completed  = typed.filter(r => r.status === "COMPLETE").length;
  const blockers   = typed.filter(r => r.hasBlocker).length;
  const pending    = totalActiveUsers - typed.length;

  const dateLabel = targetDate.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  });

  return (
    <div className="space-y-8">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isToday ? "Today's Standups" : "Standup Reports"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{dateLabel}</p>
        </div>
        {!isToday && (
          <a href="/dashboard"
             className="text-sm text-indigo-600 hover:text-indigo-700 font-medium
                        flex items-center gap-1.5 transition-colors">
            ← Back to today
          </a>
        )}
      </div>

      {/* Stats */}
      <StatsBar total={totalActiveUsers} completed={completed}
                blockers={blockers} pending={pending}/>

      {/* Blockers section */}
      {blockers > 0 && (
        <section aria-labelledby="blockers-heading">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden="true"/>
            <h2 id="blockers-heading"
                className="text-base font-bold text-red-600">
              Needs Immediate Attention
            </h2>
            <span className="bg-red-100 text-red-700 text-xs font-bold
                             px-2 py-0.5 rounded-full border border-red-200">
              {blockers} blocker{blockers !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {typed.filter(r => r.hasBlocker).map(r => (
              <ReportCard key={r.id} report={r} highlight/>
            ))}
          </div>
        </section>
      )}

      {/* All reports */}
      <section aria-labelledby="all-heading">
        <div className="flex items-center gap-3 mb-4">
          <h2 id="all-heading" className="text-base font-bold text-slate-800">
            All Reports
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            {completed} / {totalActiveUsers} submitted
          </span>
        </div>

        {typed.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl
                          shadow-sm text-center py-20">
            <p className="text-3xl mb-3" aria-hidden="true">☕</p>
            <p className="text-sm font-medium text-slate-500">
              No standups yet for this day.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {isToday ? "Check back once the team starts responding." : "Nothing was submitted on this date."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {typed.map(r => <ReportCard key={r.id} report={r}/>)}
          </div>
        )}
      </section>
    </div>
  );
}
