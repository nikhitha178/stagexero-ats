"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  Users,
  FileText,
  ArrowUpRight,
  Plus,
  Sparkles,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

type Job = {
  id: string;
  title: string;
  department?: string;
  location: string;
  status: "OPEN" | "CLOSED";
};

type Application = {
  id: string;
  stage: string;
  candidate: { id: string; fullName: string; email: string; phone?: string };
  jobId: string;
  createdAt: string;
};

const stages = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
];

const stageColors: Record<string, string> = {
  APPLIED: "bg-blue-100 text-blue-700",
  SCREENING: "bg-amber-100 text-amber-700",
  INTERVIEW: "bg-violet-100 text-violet-700",
  OFFER: "bg-emerald-100 text-emerald-700",
  HIRED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const jobsResponse = await api.get("/jobs");
        const jobData = jobsResponse.data.data ?? jobsResponse.data;
        setJobs(Array.isArray(jobData) ? jobData : []);

        const jobList: Job[] = Array.isArray(jobData) ? jobData : [];
        const results = await Promise.all(
          jobList.map(async (job) => {
            try {
              const response = await api.get(`/jobs/${job.id}/applications`);
              const data = response.data.data ?? response.data;
              return Array.isArray(data) ? data : [];
            } catch {
              return [];
            }
          })
        );

        setApplications(results.flat());
      } catch {
        toast.error("Unable to load dashboard data. Check that the backend is running.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const openJobs = jobs.filter((job) => job.status === "OPEN").length;
  const totalCandidates = new Set(
    applications.map((application) => application.candidate.email.toLowerCase())
  ).size;

  const metrics = [
    {
      label: "Open positions",
      value: openJobs,
      icon: BriefcaseBusiness,
      color: "bg-indigo-50 text-indigo-600",
      href: "/jobs",
    },
    {
      label: "Candidates",
      value: totalCandidates,
      icon: Users,
      color: "bg-sky-50 text-sky-600",
      href: "/candidates",
    },
    {
      label: "Applications",
      value: applications.length,
      icon: FileText,
      color: "bg-emerald-50 text-emerald-600",
      href: "/pipeline",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-indigo-600">Recruitment overview</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Welcome back, Recruiter
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Here&apos;s what&apos;s happening with your hiring pipeline.
          </p>
        </div>
        <Link
          href="/jobs"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          <Plus size={17} />
          Create a job
        </Link>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Link
              href={metric.href}
              key={metric.label}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-xl p-3 ${metric.color}`}>
                  <Icon size={21} />
                </div>
                <ArrowUpRight size={18} className="text-slate-300 transition group-hover:text-indigo-600" />
              </div>
              <p className="mt-5 text-sm font-medium text-slate-500">{metric.label}</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">
                {loading ? "—" : metric.value}
              </p>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">Hiring pipeline</h2>
              <p className="mt-1 text-sm text-slate-500">Applications by current stage</p>
            </div>
            <Link href="/pipeline" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              View pipeline
            </Link>
          </div>

          <div className="mt-6 space-y-5">
            {stages.map((stage) => {
              const count = applications.filter((item) => item.stage === stage).length;
              const percentage = applications.length
                ? (count / applications.length) * 100
                : 0;

              return (
                <div key={stage}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{stage}</span>
                    <span className="text-slate-500">{loading ? "—" : count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        ```tsx
        <Link
          href="/jobs"
          className="block rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 transition hover:border-indigo-300 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Sparkles size={21} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                AI Recruiting Assistant
              </h2>
              <p className="text-sm text-slate-500">
                Your AI-powered recruitment copilot
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-600">
            Search candidates, check application stages, and propose
            pipeline updates using natural language.
          </p>

          <div className="mt-5 flex items-center justify-between">
            <span className="text-sm font-semibold text-indigo-700">
              Open AI Copilot
            </span>
            <ArrowUpRight size={18} className="text-indigo-600" />
          </div>
        </Link>
        ```
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="font-semibold text-slate-900">Recent applications</h2>
            <p className="mt-1 text-sm text-slate-500">Latest candidate activity</p>
          </div>
          <Link href="/pipeline" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            View all
          </Link>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading applications...</p>
        ) : applications.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No applications found yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Candidate</th>
                  <th className="px-6 py-3 font-semibold">Position</th>
                  <th className="px-6 py-3 font-semibold">Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...applications]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 5)
                  .map((application) => (
                    <tr key={application.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800">{application.candidate.fullName}</p>
                        <p className="mt-1 text-xs text-slate-500">{application.candidate.email}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{jobs.find((job) => job.id === application.jobId)?.title ?? "Unknown job"}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${stageColors[application.stage] ?? "bg-slate-100 text-slate-600"}`}>
                          {application.stage}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

