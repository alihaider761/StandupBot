/**
 * POST /api/slack/events
 *
 * Slack Events API endpoint.
 * Handles URL verification, message.im events, and app_mention.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySlackRequest, SlackVerificationError } from "@/lib/slack-verify";
import {
  parseStandupMessage,
  mergeStandupUpdate,
  type ParsedStandup,
} from "@/lib/standup-parser";
import { sendMessage } from "@/lib/slack";

interface SlackUrlVerificationPayload {
  type: "url_verification";
  challenge: string;
  token: string;
}

interface SlackEventCallback {
  type: "event_callback";
  team_id: string;
  event: {
    type: string;
    user: string;
    text: string;
    channel: string;
    ts: string;
    channel_type?: string;
    bot_id?: string;
    subtype?: string;
  };
}

type SlackPayload = SlackUrlVerificationPayload | SlackEventCallback;

async function readRawBody(request: NextRequest): Promise<string> {
  const buffer = await request.arrayBuffer();
  return Buffer.from(buffer).toString("utf8");
}

function buildCompletionMessage(name: string, hasBlocker: boolean): string {
  const firstName = name?.split(" ")[0] ?? "there";
  if (hasBlocker) {
    return (
      `✅ Got it, ${firstName}! Your standup has been recorded.\n\n` +
      `⚠️ *I noticed you have a blocker.* Your manager has been notified and ` +
      `your report will be highlighted in today's dashboard. Hang tight! 🙏`
    );
  }
  return `✅ Thanks, ${firstName}! Your standup is all set for today. Have a productive day! 🚀`;
}

function buildFollowUpMessage(partial: Partial<ParsedStandup>): string {
  if (!partial.yesterday) return "What did you complete *yesterday*?";
  if (!partial.today)     return "What are you planning to work on *today*?";
  if (partial.roadblocks === null || partial.roadblocks === undefined)
    return `Any *blockers* or impediments? (type "none" if you're clear)`;
  return "";
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let rawBody: string;
  try {
    rawBody = await readRawBody(request);
  } catch {
    return NextResponse.json({ error: "Failed to read body." }, { status: 400 });
  }

  // ── Parse payload first ───────────────────────────────────────────────────
  let payload: SlackPayload;
  try {
    payload = JSON.parse(rawBody) as SlackPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  // ── 1. URL verification — no signature check needed ───────────────────────
  if (payload.type === "url_verification") {
    console.log("[events] URL verification challenge received ✅");
    return NextResponse.json({ challenge: payload.challenge });
  }

  // ── 2. Signature verification ─────────────────────────────────────────────
  try {
    verifySlackRequest(rawBody, {
      "x-slack-signature":        request.headers.get("x-slack-signature"),
      "x-slack-request-timestamp": request.headers.get("x-slack-request-timestamp"),
    });
  } catch (err) {
    if (err instanceof SlackVerificationError) {
      console.warn("[events] Signature verification failed:", err.message);
      return NextResponse.json({ error: "Signature verification failed." }, { status: 401 });
    }
    throw err;
  }

  // ── 3. Only handle event_callback ─────────────────────────────────────────
  if (payload.type !== "event_callback") {
    return NextResponse.json({ ok: true });
  }

  const { event, team_id } = payload;

  console.log(`[events] Received event: type=${event.type} channel_type=${event.channel_type} user=${event.user} team=${team_id}`);

  // Only handle real user DMs (not bot messages, not channel messages)
  if (
    event.type !== "message" ||
    event.channel_type !== "im" ||
    event.bot_id ||
    event.subtype
  ) {
    console.log(`[events] Skipping event: type=${event.type} bot_id=${event.bot_id} subtype=${event.subtype}`);
    return NextResponse.json({ ok: true });
  }

  // ── 4. Process standup reply ───────────────────────────────────────────────
  try {
    // 4a. Find org — try exact match first, then fall back to first org
    //     (handles case where team_id wasn't updated in DB yet)
    let organization = await prisma.organization.findUnique({
      where: { slackTeamId: team_id },
    });

    // Auto-heal: if team_id doesn't match, update it
    if (!organization) {
      console.warn(`[events] team_id ${team_id} not found — attempting auto-heal`);
      organization = await prisma.organization.findFirst();
      if (organization) {
        await prisma.organization.update({
          where: { id: organization.id },
          data: { slackTeamId: team_id },
        });
        console.log(`[events] Auto-updated org slackTeamId to ${team_id}`);
      }
    }

    if (!organization) {
      console.error(`[events] No organization found at all`);
      return NextResponse.json({ ok: true });
    }

    // 4b. Find the user
    const user = await prisma.user.findFirst({
      where: {
        slackUserId: event.user,
        organizationId: organization.id,
        isActive: true,
      },
    });

    if (!user) {
      console.warn(`[events] User ${event.user} not found in org ${organization.id}`);
      return NextResponse.json({ ok: true });
    }

    console.log(`[events] Processing reply from ${user.name} (${user.slackUserId})`);

    // 4c. Today's date at midnight UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // 4d. Load existing report if any
    const existingReport = await prisma.standupReport.findUnique({
      where: { userId_reportDate: { userId: user.id, reportDate: today } },
    });

    if (existingReport?.status === "COMPLETE") {
      await sendMessage(
        event.channel,
        "You've already submitted your standup for today! ✅ See you tomorrow.",
        organization.botAccessToken
      );
      return NextResponse.json({ ok: true });
    }

    // 4e. Parse & merge
    const incoming = parseStandupMessage(event.text);
    const existing: Partial<ParsedStandup> = {
      yesterday:  existingReport?.yesterday  ?? null,
      today:      existingReport?.today      ?? null,
      roadblocks: existingReport?.roadblocks ?? null,
    };
    const merged    = mergeStandupUpdate(existing, incoming);
    const newStatus = merged.isComplete ? "COMPLETE" : "IN_PROGRESS";

    console.log(`[events] Parsed standup: yesterday="${merged.yesterday}" today="${merged.today}" roadblocks="${merged.roadblocks}" complete=${merged.isComplete}`);

    // 4f. Save to DB
    await prisma.standupReport.upsert({
      where: { userId_reportDate: { userId: user.id, reportDate: today } },
      create: {
        userId:         user.id,
        organizationId: organization.id,
        reportDate:     today,
        yesterday:      merged.yesterday,
        today:          merged.today,
        roadblocks:     merged.roadblocks,
        hasBlocker:     merged.hasBlocker,
        status:         newStatus,
        slackChannelId: event.channel,
        slackThreadTs:  event.ts,
      },
      update: {
        yesterday:      merged.yesterday,
        today:          merged.today,
        roadblocks:     merged.roadblocks,
        hasBlocker:     merged.hasBlocker,
        status:         newStatus,
        slackChannelId: event.channel,
        slackThreadTs:  event.ts,
      },
    });

    console.log(`[events] Saved standup for ${user.name} — status: ${newStatus}`);

    // 4g. Reply in Slack
    if (merged.isComplete) {
      await sendMessage(
        event.channel,
        buildCompletionMessage(user.name ?? "", merged.hasBlocker),
        organization.botAccessToken
      );
    } else {
      const followUp = buildFollowUpMessage(merged);
      if (followUp) {
        await sendMessage(event.channel, followUp, organization.botAccessToken);
      }
    }

  } catch (err) {
    console.error("[events] Error processing event:", err);
    // Always return 200 so Slack doesn't retry endlessly
  }

  return NextResponse.json({ ok: true });
}
