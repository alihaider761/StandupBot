/**
 * PATCH /api/team/members/[id]  – toggle active / change role
 * DELETE /api/team/members/[id] – remove member
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// ── PATCH ──────────────────────────────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as { organizationId: string }).organizationId;
  const { id } = await params;

  const body = await req.json();
  const allowed: Record<string, unknown> = {};
  if (typeof body.isActive === "boolean") allowed.isActive = body.isActive;
  if (["ADMIN","MANAGER","MEMBER"].includes(body.role)) allowed.role = body.role;
  if (body.name)  allowed.name  = body.name;
  if (body.email) allowed.email = body.email;

  const member = await prisma.user.updateMany({
    where: { id, organizationId: orgId },
    data: allowed,
  });

  if (member.count === 0)
    return NextResponse.json({ error: "Member not found." }, { status: 404 });

  return NextResponse.json({ ok: true });
}

// ── DELETE ─────────────────────────────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as { organizationId: string }).organizationId;
  const { id } = await params;

  const selfId = (session.user as { id: string }).id;
  if (id === selfId)
    return NextResponse.json({ error: "You cannot remove yourself." }, { status: 400 });

  const deleted = await prisma.user.deleteMany({
    where: { id, organizationId: orgId },
  });

  if (deleted.count === 0)
    return NextResponse.json({ error: "Member not found." }, { status: 404 });

  return NextResponse.json({ ok: true });
}
