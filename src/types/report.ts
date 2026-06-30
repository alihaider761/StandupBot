/**
 * Shared TypeScript types for standup reports.
 *
 * We define these manually here so components compile before
 * `prisma generate` has run (which requires a live DB connection).
 * Once the Prisma client is generated, these will be automatically
 * compatible with the generated types.
 */

export interface ReportUser {
  id: string;
  name: string | null;
  email: string | null;
  slackUserId: string;
}

export interface ReportWithUser {
  id: string;
  reportDate: Date;
  yesterday: string | null;
  today: string | null;
  roadblocks: string | null;
  hasBlocker: boolean;
  status: string;
  slackChannelId: string | null;
  slackThreadTs: string | null;
  userId: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  user: ReportUser;
}
