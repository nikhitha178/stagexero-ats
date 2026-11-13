"use client";

import "./globals.css";
import { Toaster } from "sonner";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  GitBranch,
  Settings,
  Bell,
  Search,
  ChevronDown,
  Sparkles,
} from "lucide-react";

const navigation = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Jobs", href: "/jobs", icon: BriefcaseBusiness },
  { label: "Candidates", href: "/candidates", icon: Users },
  { label: "Pipeline", href: "/pipeline", icon: GitBranch },
];

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-slate-50 md:flex">
          <aside className="flex w-full flex-col border-r border-slate-200 bg-white md:fixed md:inset-y-0 md:w-64">
            <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
                S
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900">
                  StageXero
                </h1>
                <p className="text-xs text-slate-500">Applicant tracking</p>
              </div>
            </div>

            <div className="px-4 py-6">
              <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Workspace
              </p>
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${active
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                      <Icon size={19} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="mt-auto border-t border-slate-100 p-4">
              <Link
                href="/settings"
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-600 hover:bg-slate-50"
              >
                <Settings size={19} />
                Settings
              </Link>
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                  NJ
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    Recruiter
                  </p>
                  <p className="text-xs text-slate-500">Workspace admin</p>
                </div>
                <ChevronDown size={16} className="ml-auto text-slate-400" />
              </div>
            </div>
          </aside>

          <main className="min-w-0 flex-1 md:ml-64">
            <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur md:px-8">
              <div>
                <p className="text-sm text-slate-500">Workspace / Recruitment</p>
                <h2 className="text-lg font-semibold text-slate-900">
                  {navigation.find((item) => item.href === pathname)?.label ?? "Workspace"}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-400 sm:flex">
                  <Search size={16} />
                  <span>Search workspace</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">? K</span>
                </div>
                <button
                  aria-label="Notifications"
                  className="rounded-lg border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50"
                >
                  <Bell size={18} />
                </button>
              </div>
            </header>

            <div className="mx-auto max-w-7xl p-5 md:p-8">{children}</div>
          </main>
        </div>

        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={3000}
        />
      </body>
    </html>
  );
}
