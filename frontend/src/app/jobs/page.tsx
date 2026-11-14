"use client";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  BriefcaseBusiness,
  MapPin,
  Plus,
  Search,
  X,
  Users,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

type Job = {
  id: string;
  title: string;
  location: string;
  status: "OPEN" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  _count?: {
    applications: number;
  };
};

type JobStatusFilter = "ALL" | "OPEN" | "CLOSED";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatusFilter>("ALL");

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<"OPEN" | "CLOSED">("OPEN");

  async function loadJobs() {
    try {
      const response = await api.get("/jobs");
      const data = response.data.data;
      setJobs(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Unable to load jobs. Please check the backend connection.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.location.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || job.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, statusFilter]);

  const openCount = jobs.filter((job) => job.status === "OPEN").length;
  const closedCount = jobs.filter((job) => job.status === "CLOSED").length;

  async function handleCreateJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (title.trim().length < 2 || location.trim().length < 2) {
      toast.error("Title and location must contain at least 2 characters.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post("/jobs", {
        title: title.trim(),
        location: location.trim(),
        status,
      });

      const createdJob = response.data.data as Job;

      setJobs((previous) => [createdJob, ...previous]);
      setTitle("");
      setLocation("");
      setStatus("OPEN");
      setShowForm(false);

      toast.success("Job created successfully.");
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
          error !== null &&
          "response" in error &&
          typeof error.response === "object" &&
          error.response !== null &&
          "data" in error.response &&
          typeof error.response.data === "object" &&
          error.response.data !== null &&
          "message" in error.response.data
          ? String(error.response.data.message)
          : "Unable to create job. Please try again.";

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-indigo-600">Recruitment workspace</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Job openings
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Create and manage your recruitment opportunities.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          <Plus size={18} />
          Create job
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total jobs", value: jobs.length },
          { label: "Open positions", value: openCount },
          { label: "Closed positions", value: closedCount },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {loading ? "—" : item.value}
            </p>
          </div>
        ))}
      </section>

      {showForm && (
        <section className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Create a new job
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter the job details below.
              </p>
            </div>
            <button
              onClick={() => setShowForm(false)}
              aria-label="Close form"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={19} />
            </button>
          </div>

          <form onSubmit={handleCreateJob} className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="job-title" className="mb-2 block text-sm font-medium text-slate-700">
                Job title
              </label>
              <input
                id="job-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Full Stack Developer"
                maxLength={120}
                required
                minLength={2}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label htmlFor="job-location" className="mb-2 block text-sm font-medium text-slate-700">
                Location
              </label>
              <input
                id="job-location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="e.g. Hyderabad"
                maxLength={120}
                required
                minLength={2}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label htmlFor="job-status" className="mb-2 block text-sm font-medium text-slate-700">
                Initial status
              </label>
              <select
                id="job-status"
                value={status}
                onChange={(event) => setStatus(event.target.value as "OPEN" | "CLOSED")}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
              >
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div className="flex items-end justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? "Creating..." : "Create job"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">All positions</h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredJobs.length} job{filteredJobs.length === 1 ? "" : "s"} found
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3">
              <Search size={17} className="text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search jobs..."
                className="w-full py-2.5 text-sm outline-none sm:w-48"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as JobStatusFilter)}
              aria-label="Filter by job status"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
            >
              <option value="ALL">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500">
            <Loader2 size={18} className="animate-spin" />
            Loading jobs...
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <BriefcaseBusiness size={34} className="text-slate-300" />
            <h3 className="mt-4 font-semibold text-slate-800">No jobs found</h3>
            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or create a new job.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredJobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="flex flex-col justify-between gap-4 p-5 transition hover:bg-indigo-50/40 sm:flex-row sm:items-center"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                    <BriefcaseBusiness size={21} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{job.title}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={15} />
                        {job.location}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users size={15} />
                        {job._count?.applications ?? 0} applications
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      Created {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${job.status === "OPEN"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                    }`}
                >
                  {job.status === "OPEN" ? "Open" : "Closed"}
                </span>
              </Link>))}
          </div>
        )}
      </section>
    </div>
  );
}
