/**
 * Database seed script.
 * Run:  npx prisma db seed   OR   npm run db:seed
 *
 * Creates:
 *  - 1 Organization (Demo Workspace)
 *  - 1 Admin user   → admin@example.com / admin1234
 *  - 3 Member users (Alice, Bob, Carol)
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg }     from "@prisma/adapter-pg";
import bcrypt           from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;
const adapter  = new PrismaPg({ connectionString });
const prisma   = new PrismaClient({ adapter });

async function main() {
  console.log("🌱  Seeding …");

  // ── Organisation ──────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where:  { slackTeamId: "T_DEMO" },
    update: {},
    create: {
      slackTeamId:        "T_DEMO",
      slackTeamName:      "Demo Workspace",
      botAccessToken:     process.env.SLACK_BOT_TOKEN ?? "xoxb-placeholder",
      subscriptionStatus: "inactive",
    },
  });
  console.log(`✅  Org: ${org.slackTeamName}  (${org.id})`);

  // ── Admin user ─────────────────────────────────────────────
  const hash = await bcrypt.hash("admin1234", 12);
  const admin = await prisma.user.upsert({
    where:  { slackUserId: "U_ADMIN" },
    update: {},
    create: {
      slackUserId:    "U_ADMIN",
      email:          "admin@example.com",
      name:           "Admin User",
      role:           "ADMIN",
      isActive:       true,
      passwordHash:   hash,
      organizationId: org.id,
    },
  });
  console.log(`✅  Admin: ${admin.email}`);

  // ── Team members ───────────────────────────────────────────
  const members = [
    { slackUserId: "U_ALICE", name: "Alice Chen",  email: "alice@example.com" },
    { slackUserId: "U_BOB",   name: "Bob Smith",   email: "bob@example.com"   },
    { slackUserId: "U_CAROL", name: "Carol Davis", email: "carol@example.com" },
  ];

  for (const m of members) {
    const u = await prisma.user.upsert({
      where:  { slackUserId: m.slackUserId },
      update: {},
      create: { ...m, role: "MEMBER", isActive: true, organizationId: org.id },
    });
    console.log(`✅  Member: ${u.name}`);
  }

  console.log("\n🎉  Seed complete!");
  console.log("    Login → admin@example.com  /  admin1234");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
