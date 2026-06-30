/**
 * POST /api/auth/register
 * Creates a new MANAGER account. First user in an org becomes ADMIN.
 */
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    // Find the real org — must have a valid Slack team ID (not a generated one)
    let org = await prisma.organization.findFirst({
      where: {
        NOT: { slackTeamId: { startsWith: "team_" } },
      },
      orderBy: { createdAt: "asc" },
    });

    // Fallback: any org
    if (!org) {
      org = await prisma.organization.findFirst({ orderBy: { createdAt: "asc" } });
    }

    // Last resort: create one
    if (!org) {
      org = await prisma.organization.create({
        data: {
          slackTeamId:        `team_${Date.now()}`,
          slackTeamName:      "My Workspace",
          botAccessToken:     process.env.SLACK_BOT_TOKEN ?? "",
          subscriptionStatus: "inactive",
        },
      });
    }

    // First manager-level user becomes ADMIN
    const isFirstAdmin = !(await prisma.user.findFirst({
      where: { organizationId: org.id, role: { in: ["ADMIN", "MANAGER"] } },
    }));

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        slackUserId: `manual_${Date.now()}`,
        role: isFirstAdmin ? "ADMIN" : "MANAGER",
        isActive: true,
        organizationId: org.id,
      },
    });

    return NextResponse.json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
