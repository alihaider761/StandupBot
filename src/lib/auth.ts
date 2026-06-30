/**
 * NextAuth v4 configuration.
 *
 * Uses the Credentials provider so project managers can log into the
 * dashboard with an email + password stored in the database.
 * The password is bcrypt-hashed; plain-text passwords are never stored.
 */
import NextAuth, { type NextAuthOptions, type Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      organizationId: string;
    };
  }
  interface User {
    role: string;
    organizationId: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    organizationId: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email,
            role: { in: ["ADMIN", "MANAGER"] },
            isActive: true,
          },
          include: { organization: true },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const passwordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!passwordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email ?? "",
          name: user.name ?? "",
          role: user.role,
          organizationId: user.organizationId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organizationId = user.organizationId;
      }
      return token;
    },
    async session({ session, token }): Promise<Session> {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
          organizationId: token.organizationId,
        },
      };
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Convenience wrapper — returns the server-side session in App Router
 * server components and route handlers.
 */
export function auth() {
  return getServerSession(authOptions);
}

export default NextAuth(authOptions);
