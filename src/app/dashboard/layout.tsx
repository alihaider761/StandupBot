import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardNav } from "@/components/DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <DashboardNav user={session.user} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
