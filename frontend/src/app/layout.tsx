"use client";

import "./globals.css";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";
import api from "@/lib/api";
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
} from "lucide-react";

const navigation = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Jobs", href: "/jobs", icon: BriefcaseBusiness },
  { label: "Candidates", href: "/candidates", icon: Users },
  { label: "Pipeline", href: "/pipeline", icon: GitBranch },
];
type SearchJob = {
  id: string;
  title: string;
  location: string;
};

type SearchApplication = {
  id: string;
  jobId: string;
  candidate: {
    fullName: string;
    email: string;
  };
};

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const [searchResults, setSearchResults] = useState<{
    jobs: SearchJob[];
    candidates: SearchApplication[];
  }>({
    jobs: [],
    candidates: [],
  });
  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();

    if (query.length < 2) {
      setSearchResults({ jobs: [], candidates: [] });
      setSearchLoading(false);
      return;
    }

    let cancelled = false;

    const timer = window.setTimeout(async () => {
      setSearchLoading(true);

      try {
        const response = await api.get("/jobs");
        const jobs: SearchJob[] = response.data.data ?? [];

        const applicationResults = await Promise.all(
          jobs.map(async (job) => {
            try {
              const result = await api.get(
                `/jobs/${job.id}/applications`
              );

              return result.data.data ?? [];
            } catch {
              return [];
            }
          })
        );

        const applications: SearchApplication[] =
          applicationResults.flat();

        if (!cancelled) {
          setSearchResults({
            jobs: jobs.filter(
              (job) =>
                job.title.toLowerCase().includes(query) ||
                job.location.toLowerCase().includes(query)
            ),
            candidates: applications.filter(
              (application) =>
                application.candidate.fullName
                  .toLowerCase()
                  .includes(query) ||
                application.candidate.email
                  .toLowerCase()
                  .includes(query)
            ),
          });
        }
      } catch {
        if (!cancelled) {
          setSearchResults({ jobs: [], candidates: [] });
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchQuery]);
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
                <div className="relative hidden sm:block">
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <Search size={16} className="text-slate-400" />

                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search jobs or candidates..."
                      className="w-64 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    />

                    {searchLoading && (
                      <span className="text-xs text-slate-400">Searching...</span>
                    )}
                  </div>

                  {searchQuery.trim().length >= 2 && (
                    <div className="absolute right-0 top-full z-50 mt-2 max-h-96 w-80 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                      {searchLoading ? (
                        <p className="p-3 text-sm text-slate-500">
                          Searching...
                        </p>
                      ) : searchResults.jobs.length === 0 &&
                        searchResults.candidates.length === 0 ? (
                        <p className="p-3 text-sm text-slate-500">
                          No matching jobs or candidates found.
                        </p>
                      ) : (
                        <>
                          {searchResults.jobs.length > 0 && (
                            <div className="mb-2">
                              <p className="px-3 py-2 text-xs font-semibold uppercase text-slate-400">
                                Jobs
                              </p>

                              {searchResults.jobs.map((job) => (
                                <Link
                                  key={job.id}
                                  href={`/jobs/${job.id}`}
                                  onClick={() => setSearchQuery("")}
                                  className="block rounded-lg px-3 py-2 hover:bg-slate-50"
                                >
                                  <p className="text-sm font-medium text-slate-800">
                                    {job.title}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {job.location}
                                  </p>
                                </Link>
                              ))}
                            </div>
                          )}

                          {searchResults.candidates.length > 0 && (
                            <div>
                              <p className="px-3 py-2 text-xs font-semibold uppercase text-slate-400">
                                Candidates
                              </p>

                              {searchResults.candidates.map((application) => (
                                <Link
                                  key={application.id}
                                  href={`/jobs/${application.jobId}`}
                                  onClick={() => setSearchQuery("")}
                                  className="block rounded-lg px-3 py-2 hover:bg-slate-50"
                                >
                                  <p className="text-sm font-medium text-slate-800">
                                    {application.candidate.fullName}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {application.candidate.email}
                                  </p>
                                </Link>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
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
