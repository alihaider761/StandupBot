/**
 * GET  /api/team/members  – list all users in the org
 * POST /api/team/members  – add a new member by Slack User ID
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSlackClient } from "@/lib/slack";

// ── GET ────────────────────────────────────────────────────────────────
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as { organizationId: string }).organizationId;

  const members = await prisma.user.findMany({
    where: { organizationId: orgId },
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true, slackUserId: true, name: true,
      email: true, role: true, isActive: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ members });
}

// ── POST ───────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as { organizationId: string }).organizationId;

  const { slackUserId, name, email, role } = await req.json();

  if (!slackUserId?.trim()) {
    return NextResponse.json({ error: "Slack User ID is required." }, { status: 400 });
  }

  // Validate the Slack user ID exists in the workspace
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) return NextResponse.json({ error: "Org not found." }, { status: 404 });

  // Try to resolve the user's real name from Slack if not provided
  let resolvedName = name?.trim() || null;
  let resolvedEmail = email?.trim() || null;

  try {
    const slack = getSlackClient(org.botAccessToken);
    const info = await slack.users.info({ user: slackUserId.trim() });
    if (info.ok && info.user) {
      resolvedName  = resolvedName  || info.user.real_name || info.user.name || slackUserId;
      resolvedEmail = resolvedEmail || info.user.profile?.email || null;
    }
  } catch {
    // users:read scope not granted — use what was provided
    if (!resolvedName) resolvedName = slackUserId;
  }

  // Check for duplicate
  const existing = await prisma.user.findUnique({ where: { slackUserId: slackUserId.trim() } });
  if (existing) {
    // If they exist but are inactive, reactivate them
    if (!existing.isActive) {
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: { isActive: true, name: resolvedName, email: resolvedEmail },
      });
      return NextResponse.json({ member: updated, reactivated: true });
    }
    return NextResponse.json({ error: "This Slack user is already a team member." }, { status: 409 });
  }

  const member = await prisma.user.create({
    data: {
      slackUserId:    slackUserId.trim(),
      name:           resolvedName,
      email:          resolvedEmail,
      role:           role || "MEMBER",
      isActive:       true,
      organizationId: orgId,
    },
  });

  return NextResponse.json({ member }, { status: 201 });
}
