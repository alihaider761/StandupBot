/**
 * GET /api/dashboard/reports?date=YYYY-MM-DD
 *
 * Returns all standup reports for the authenticated manager's organization
 * on the given date.  Falls back to today if no date is provided.
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
  const dateParam = searchParams.get("date");

  let targetDate: Date;
  if (dateParam) {
    targetDate = new Date(dateParam);
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD." },
        { status: 400 }
      );
    }
  } else {
    targetDate = new Date();
  }
  targetDate.setUTCHours(0, 0, 0, 0);

  const reports = await prisma.standupReport.findMany({
    where: {
      organizationId: orgId,
      reportDate: targetDate,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          slackUserId: true,
        },
      },
    },
    orderBy: [{ hasBlocker: "desc" }, { user: { name: "asc" } }],
  });

  return NextResponse.json({ date: targetDate.toISOString(), reports });
}
