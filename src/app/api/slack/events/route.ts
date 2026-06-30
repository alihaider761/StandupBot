/**
 * POST /api/slack/events
 *
 * Slack Events API endpoint.
 *
 * Handles:
 *  - URL verification challenge (initial setup)
 *  - message.im events (DM replies from users answering the standup)
 *
 * Security: Every request is verified against the Slack signing secret
 * before any business logic runs.
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

// ── Types ──────────────────────────────────────────────────────────────────

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

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Reads the raw body from a NextRequest as a string while preserving the
 * bytes needed for signature verification.
 */
async function readRawBody(request: NextRequest): Promise<string> {
  const buffer = await request.arrayBuffer();
  return Buffer.from(buffer).toString("utf8");
}

/**
 * Returns a friendly confirmation DM once the user has completed all three
 * questions.
 */
function buildCompletionMessage(name: string, hasBlocker: boolean): string {
  const firstName = name?.split(" ")[0] ?? "there";
  if (hasBlocker) {
    return (
      `✅ Got it, ${firstName}! Your standup has been recorded.\n\n` +
      `⚠️ *I noticed you have a blocker.* Your manager has been notified and ` +
      `your report will be highlighted in today's dashboard. Hang tight! 🙏`
    );
  }
  return (
    `✅ Thanks, ${firstName}! Your standup is all set for today.\n` +
    `Have a productive day! 🚀`
  );
}

/**
 * Returns a prompt asking for the next unanswered question.
 */
function buildFollowUpMessage(partial: Partial<ParsedStandup>): string {
  if (!partial.yesterday) {
    return "What did you complete *yesterday*?";
  }
  if (!partial.today) {
    return "What are you planning to work on *today*?";
  }
  if (partial.roadblocks === null || partial.roadblocks === undefined) {
    return "Do you have any *blockers* or impediments? (type \"none\" if you're clear)";
  }
  return "";
}

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  let rawBody: string;

  try {
    rawBody = await readRawBody(request);
  } catch {
    return NextResponse.json(
      { error: "Failed to read request body." },
      { status: 400 }
    );
  }

  // ── 1. Slack URL verification (no signature required on first challenge) ──
  let payload: SlackPayload;
  try {
    payload = JSON.parse(rawBody) as SlackPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  if (payload.type === "url_verification") {
    // Slack sends this when you first register the Events URL
    return NextResponse.json({ challenge: payload.challenge });
  }

  // ── 2. Signature verification ─────────────────────────────────────────────
  try {
    verifySlackRequest(rawBody, {
      "x-slack-signature": request.headers.get("x-slack-signature"),
      "x-slack-request-timestamp": request.headers.get(
        "x-slack-request-timestamp"
      ),
    });
  } catch (err) {
    if (err instanceof SlackVerificationError) {
      console.warn("[events] Slack signature verification failed:", err.message);
      return NextResponse.json(
        { error: "Signature verification failed." },
        { status: 401 }
      );
    }
    throw err;
  }

  // ── 3. Route event types ──────────────────────────────────────────────────
  if (payload.type !== "event_callback") {
    // ACK unknown event types so Slack doesn't retry
    return NextResponse.json({ ok: true });
  }

  const { event, team_id } = payload;

  // Only handle direct messages (im) from real users (not bots)
  if (
    event.type !== "message" ||
    event.channel_type !== "im" ||
    event.bot_id ||
    event.subtype
  ) {
    return NextResponse.json({ ok: true });
  }

  // ── 4. Process the standup reply ──────────────────────────────────────────
  // Always respond with 200 immediately; do processing async-compatible style
  // (Next.js serverless functions are synchronous within the handler, so we
  //  process inline and Slack's 3-second timeout is sufficient for DB ops)

  try {
    // 4a. Resolve the organization from the team_id
    const organization = await prisma.organization.findUnique({
      where: { slackTeamId: team_id },
    });
    if (!organization) {
      console.warn(`[events] Unknown team_id: ${team_id}`);
      return NextResponse.json({ ok: true });
    }

    // 4b. Resolve the user
    const user = await prisma.user.findFirst({
      where: {
        slackUserId: event.user,
        organizationId: organization.id,
        isActive: true,
      },
    });
    if (!user) {
      // User not found or inactive – silently ACK
      return NextResponse.json({ ok: true });
    }

    // 4c. Find today's standup report
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const existingReport = await prisma.standupReport.findUnique({
      where: { userId_reportDate: { userId: user.id, reportDate: today } },
    });

    // If already completed, send a friendly note and stop
    if (existingReport?.status === "COMPLETE") {
      await sendMessage(
        event.channel,
        "You've already submitted your standup for today! ✅ See you tomorrow.",
        organization.botAccessToken
      );
      return NextResponse.json({ ok: true });
    }

    // 4d. Parse the incoming message
    const incoming = parseStandupMessage(event.text);

    // 4e. Merge with any existing partial data
    const existing: Partial<ParsedStandup> = {
      yesterday: existingReport?.yesterday ?? null,
      today: existingReport?.today ?? null,
      roadblocks: existingReport?.roadblocks ?? null,
    };
    const merged = mergeStandupUpdate(existing, incoming);

    // 4f. Determine new status
    const newStatus = merged.isComplete ? "COMPLETE" : "IN_PROGRESS";

    // 4g. Persist to database
    await prisma.standupReport.upsert({
      where: { userId_reportDate: { userId: user.id, reportDate: today } },
      create: {
        userId: user.id,
        organizationId: organization.id,
        reportDate: today,
        yesterday: merged.yesterday,
        today: merged.today,
        roadblocks: merged.roadblocks,
        hasBlocker: merged.hasBlocker,
        status: newStatus,
        slackChannelId: event.channel,
        slackThreadTs: event.ts,
      },
      update: {
        yesterday: merged.yesterday,
        today: merged.today,
        roadblocks: merged.roadblocks,
        hasBlocker: merged.hasBlocker,
        status: newStatus,
        slackChannelId: event.channel,
        slackThreadTs: event.ts,
      },
    });

    // 4h. Reply to the user
    if (merged.isComplete) {
      await sendMessage(
        event.channel,
        buildCompletionMessage(user.name ?? "", merged.hasBlocker),
        organization.botAccessToken
      );
    } else {
      const followUp = buildFollowUpMessage(merged);
      if (followUp) {
        await sendMessage(
          event.channel,
          followUp,
          organization.botAccessToken
        );
      }
    }
  } catch (err) {
    // Log but still return 200 so Slack doesn't retry
    console.error("[events] Error processing event:", err);
  }

  return NextResponse.json({ ok: true });
}
