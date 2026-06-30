import { LoginForm } from "@/components/LoginForm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Sign In – Standup Bot" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-indigo-50
                     flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl
                          bg-indigo-600 shadow-lg shadow-indigo-200 mb-4">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0
                   01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0
                   01-2 2h-5l-5 5v-5z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Standup Bot</h1>
          <p className="text-sm text-slate-500 mt-1">
            Async daily standups for your team
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60
                        border border-slate-200/80 p-8">
          <LoginForm />
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          By signing in you agree to our{" "}
          <a href="/terms" className="underline hover:text-slate-600">Terms</a>
          {" "}and{" "}
          <a href="/privacy" className="underline hover:text-slate-600">Privacy Policy</a>.
        </p>
      </div>
    </main>
  );
}
