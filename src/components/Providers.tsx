"use client";

/**
 * Client-side providers wrapper.
 * Wraps the app in SessionProvider so useSession() works in client components.
 */
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
