/**
 * Prisma v7 client singleton using the @prisma/adapter-pg driver adapter.
 *
 * Prisma v7 dropped the binary query engine and requires a driver adapter.
 * We use @prisma/adapter-pg with the standard `pg` Pool for a direct
 * PostgreSQL connection.
 *
 * The client is created lazily on first access so that pages which don't
 * touch the database (login page rendering, public pages) don't crash when
 * DATABASE_URL is not yet configured.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

let _prismaInstance: PrismaClient | undefined;

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes("USER:PASSWORD")) {
    throw new Error(
      "DATABASE_URL is not configured. Set a valid PostgreSQL connection string in your .env file."
    );
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

/**
 * Returns the shared PrismaClient, creating it on first call.
 * Throws a clear error if DATABASE_URL is not set.
 */
function getPrisma(): PrismaClient {
  if (global.__prisma) return global.__prisma;
  if (_prismaInstance) return _prismaInstance;

  _prismaInstance = createPrismaClient();

  if (process.env.NODE_ENV !== "production") {
    global.__prisma = _prismaInstance;
  }

  return _prismaInstance;
}

/**
 * Proxy that defers PrismaClient creation until the first property access.
 * This means importing `prisma` from this module is always safe —
 * the error is only thrown when you actually make a DB call.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
