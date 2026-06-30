/**
 * POST /api/cron/trigger-standup
 *
 * Cron job endpoint that sends the daily standup DM to every active user.
 * Intended to be called by an external scheduler (e.g. Vercel Cron Jobs,
 * GitHub Actions, or any cron service) on a fixed daily schedule.
 *
 * Security: The caller must supply the correct Authorization header.
 *   Authorization: Bearer <CRON_SECRET>
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { openDmChannel, sendMessage } from "@/lib/slack";

// ── Authorization check ────────────────────────────────────────────────────

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[cron] CRON_SECRET is not configured.");
    return false;
  }
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return false;
  const [scheme, token] = authHeader.split(" ");
  return scheme === "Bearer" && token === cronSecret;
}

// ── Standup prompt message ─────────────────────────────────────────────────

function buildStandupPrompt(name: string): string {
  const firstName = name?.split(" ")[0] ?? "there";
  return (
    `👋 Hey ${firstName}! Time for your async standup.\n\n` +
    `Please reply with your update in this format:\n\n` +
    `*1.* What did you complete *yesterday*?\n` +
    `*2.* What are you working on *today*?\n` +
    `*3.* Any *blockers* or impediments? (type "none" if clear)\n\n` +
    `_You can answer all three in one message or reply separately — I'll keep track!_ 🚀`
  );
}

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Verify authorization
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized. Provide a valid Bearer token." },
      { status: 401 }
    );
  }

  // 2. Determine the target date (today, UTC)
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // 3. Load all active users across all organizations
  const activeUsers = await prisma.user.findMany({
    where: { isActive: true },
    include: { organization: true },
  });

  if (activeUsers.length === 0) {
    return NextResponse.json({ message: "No active users found.", sent: 0 });
  }

  const results: { userId: string; status: string; error?: string }[] = [];

  for (const user of activeUsers) {
    try {
      // 4a. Skip users in orgs with non-active billing (grace period: still
      //     send if org was never billed, to support free-tier / trial)
      const { subscriptionStatus } = user.organization;
      if (
        subscriptionStatus === "past_due" ||
        subscriptionStatus === "canceled"
      ) {
        results.push({
          userId: user.slackUserId,
          status: "skipped",
          error: `Org subscription status: ${subscriptionStatus}`,
        });
        continue;
      }

      // 4b. Skip if the user already has ANY report for today (sent or complete)
      const existingReport = await prisma.standupReport.findUnique({
        where: { userId_reportDate: { userId: user.id, reportDate: today } },
      });
      if (existingReport) {
        results.push({ userId: user.slackUserId, status: "already_sent" });
        continue;
      }

      // 4c. Open (or reuse) a DM channel with the user
      const orgToken = user.organization.botAccessToken;
      const dmChannelId = await openDmChannel(user.slackUserId, orgToken);

      // 4d. Update the cached dmChannelId if it changed
      if (user.dmChannelId !== dmChannelId) {
        await prisma.user.update({
          where: { id: user.id },
          data: { dmChannelId },
        });
      }

      // 4e. Send the standup prompt
      const { ts } = await sendMessage(
        dmChannelId,
        buildStandupPrompt(user.name ?? ""),
        orgToken
      );

      // 4f. Upsert a PENDING standup report for today
      await prisma.standupReport.upsert({
        where: { userId_reportDate: { userId: user.id, reportDate: today } },
        create: {
          userId: user.id,
          organizationId: user.organizationId,
          reportDate: today,
          status: "PENDING",
          slackChannelId: dmChannelId,
          slackThreadTs: ts,
        },
        update: {
          status: "PENDING",
          slackChannelId: dmChannelId,
          slackThreadTs: ts,
        },
      });

      results.push({ userId: user.slackUserId, status: "sent" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[cron] Failed for user ${user.slackUserId}:`, message);
      results.push({
        userId: user.slackUserId,
        status: "error",
        error: message,
      });
    }
  }

  const sent = results.filter((r) => r.status === "sent").length;
  const errors = results.filter((r) => r.status === "error").length;

  console.log(`[cron] Standup trigger complete. Sent: ${sent}, Errors: ${errors}`);

  return NextResponse.json({
    message: "Standup trigger complete.",
    sent,
    errors,
    results,
  });
}

// Disallow other methods
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}
