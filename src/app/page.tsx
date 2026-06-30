/**
 * Root page — redirects authenticated users to the dashboard,
 * unauthenticated users to the login page.
 */
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
