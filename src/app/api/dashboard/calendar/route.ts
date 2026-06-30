/**
 * GET /api/dashboard/calendar?year=2024&month=6
 *
 * Returns a summary of standup activity per day for the requested month.
 * Used to populate the calendar grid on the dashboard.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // @ts-ignore – custom session field
  const orgId: string = (session!.user as { organizationId: string }).organizationId;

  const { searchParams } = new URL(request.url);
  const now = new Date();
  const year = parseInt(searchParams.get("year") ?? String(now.getUTCFullYear()), 10);
  const month = parseInt(searchParams.get("month") ?? String(now.getUTCMonth() + 1), 10);

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return NextResponse.json(
      { error: "Provide valid year (YYYY) and month (1-12)." },
      { status: 400 }
    );
  }

  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 1)); // exclusive

  // Aggregate by date
  const reports = await prisma.standupReport.findMany({
    where: {
      organizationId: orgId,
      reportDate: { gte: startDate, lt: endDate },
    },
    select: {
      reportDate: true,
      status: true,
      hasBlocker: true,
    },
  });

  // Build a day-keyed map: { "2024-06-03": { total, complete, blockers } }
  const dayMap: Record<
    string,
    { total: number; complete: number; blockers: number }
  > = {};

  for (const r of reports) {
    const key = r.reportDate.toISOString().slice(0, 10);
    if (!dayMap[key]) {
      dayMap[key] = { total: 0, complete: 0, blockers: 0 };
    }
    dayMap[key].total += 1;
    if (r.status === "COMPLETE") dayMap[key].complete += 1;
    if (r.hasBlocker) dayMap[key].blockers += 1;
  }

  return NextResponse.json({ year, month, days: dayMap });
}
