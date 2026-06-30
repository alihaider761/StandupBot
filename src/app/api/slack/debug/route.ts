/**
 * GET /api/slack/debug
 * Returns the current org/user state so you can verify config without SQL.
 * Protected by CRON_SECRET.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("Authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgs = await prisma.organization.findMany({
    select: { id: true, slackTeamId: true, slackTeamName: true, subscriptionStatus: true },
  });

  const users = await prisma.user.findMany({
    select: { id: true, slackUserId: true, name: true, isActive: true, role: true },
  });

  const todayReports = await prisma.standupReport.findMany({
    where: {
      reportDate: (() => { const d = new Date(); d.setUTCHours(0,0,0,0); return d; })(),
    },
    select: { userId: true, status: true, yesterday: true, today: true, roadblocks: true },
  });

  return NextResponse.json({ orgs, users, todayReports });
}
