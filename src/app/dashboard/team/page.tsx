/**
 * /dashboard/team — Team member management page.
 * Managers can add members by Slack User ID, toggle active status, and remove members.
 */
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TeamClient } from "@/components/TeamClient";

export const metadata = { title: "Team – Standup Bot" };

export default async function TeamPage() {
  const session = await auth();
  const orgId = (session!.user as { organizationId: string }).organizationId;

  const members = await prisma.user.findMany({
    where: { organizationId: orgId },
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true, slackUserId: true, name: true,
      email: true, role: true, isActive: true,
      createdAt: true,
    },
  });

  const activeCount = members.filter(m => m.isActive).length;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Team</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage who receives the daily standup prompt
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200
                        rounded-xl px-4 py-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500" aria-hidden="true"/>
          <span className="text-sm font-semibold text-indigo-700">
            {activeCount} active seat{activeCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <TeamClient initialMembers={members as TeamMember[]}/>
    </div>
  );
}

export interface TeamMember {
  id: string;
  slackUserId: string;
  name: string | null;
  email: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date;
}
