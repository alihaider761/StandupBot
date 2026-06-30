"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { User } from "next-auth";

interface NavItem { label: string; href: string; icon: React.ReactNode; badge?: string; }
interface Props { user: User; }

const NAV_ITEMS: NavItem[] = [
  {
    label: "Today",
    href: "/dashboard",
    icon: (
      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24"
           stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2
             2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0
             011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
      </svg>
    ),
  },
  {
    label: "Calendar",
    href: "/dashboard/calendar",
    icon: (
      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24"
           stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0
             00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
    ),
  },
  {
    label: "Billing",
    href: "/dashboard/billing",
    badge: "Soon",
    icon: (
      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24"
           stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0
             00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
      </svg>
    ),
  },
];

export function DashboardNav({ user }: Props) {
  const pathname = usePathname();

  return (
    <nav className="w-56 shrink-0 bg-white border-r border-slate-200 flex flex-col
                    shadow-[1px_0_0_0_rgb(241,245,249)]"
         aria-label="Sidebar navigation">

      {/* Brand */}
      <div className="h-16 flex items-center px-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center
                          justify-center shadow-sm shadow-indigo-200 shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0
                   01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0
                   01-2 2h-5l-5 5v-5z"/>
            </svg>
          </div>
          <span className="font-bold text-sm text-slate-900 tracking-tight">Standup Bot</span>
        </div>
      </div>

      {/* Nav links */}
      <div className="flex-1 py-5 px-3 space-y-0.5">
        <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase
                      tracking-widest mb-2">Menu</p>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                    font-medium transition-all group
                    ${isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
              <span className={`transition-colors ${isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-[9px] font-bold text-indigo-600
                                 bg-indigo-50 border border-indigo-200
                                 px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* User section */}
      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center
                          justify-center text-white text-xs font-bold shrink-0
                          shadow-sm shadow-indigo-200" aria-hidden="true">
            {user.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate leading-none">
              {user.name ?? "User"}
            </p>
            <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
          </div>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-2 text-xs text-slate-500
                           hover:text-red-600 px-3 py-2 rounded-lg
                           hover:bg-red-50 transition-colors font-medium">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0
                 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Sign out
        </button>
      </div>
    </nav>
  );
}
