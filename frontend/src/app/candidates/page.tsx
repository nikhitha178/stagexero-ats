"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Search, UserPlus, Users } from "lucide-react";
import api from "@/lib/api";

type Job = {
  id: string;
  title: string;
  location: string;
  status: "OPEN" | "CLOSED";
};

type Application = {
  id: string;
  jobId: string;
  stage: string;
  createdAt: string;
  candidate: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
  };
};

export default function CandidatesPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [jobId, setJobId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const response = await api.get("/jobs");
      const jobList: Job[] = response.data.data ?? response.data;
      setJobs(jobList);

      const results = await Promise.all(
        jobList.map(async (job) => {
          const result = await api.get(`/jobs/${job.id}/applications`);
          return result.data.data ?? result.data;
        })
      );

      setApplications(results.flat());
    } catch {
      toast.error("Unable to load candidates. Check the backend server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const filtered = applications.filter((item) => {
    const query = search.toLowerCase();
    return (
      item.candidate.fullName.toLowerCase().includes(query) ||
      item.candidate.email.toLowerCase().includes(query)
    );
  });

  const uniqueCandidates = new Set(
    applications.map((item) => item.candidate.email.toLowerCase())
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!jobId) {
      toast.error("Please select a job.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/jobs/${jobId}/applications`, {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
      });

      toast.success("Candidate added successfully.");
      setFullName("");
      setEmail("");
      setPhone("");
      setJobId("");
      setShowForm(false);
      await loadData();
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error !== null && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message || "Could not add candidate.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Manage your talent pool</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Candidates</h1>
          <p className="mt-1 text-sm text-slate-500">
            View candidates and their job applications.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <UserPlus size={17} /> Add candidate
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5">
          <Users className="text-indigo-600" />
          <p className="mt-3 text-sm text-slate-500">Total candidates</p>
          <p className="text-3xl font-bold">{uniqueCandidates.size}</p>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-slate-500">Total applications</p>
          <p className="mt-3 text-3xl font-bold">{applications.length}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white">
        <div className="border-b p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search candidates by name or email"
              className="w-full rounded-xl border bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-400"
            />
          </div>
        </div>

        {loading ? (
          <p className="p-10 text-center text-slate-500">Loading candidates...</p>
        ) : filtered.length === 0 ? (
          <p className="p-10 text-center text-slate-500">No candidates found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-4">Candidate</th>
                  <th className="p-4">Job</th>
                  <th className="p-4">Stage</th>
                  <th className="p-4">Applied on</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((item) => {
                  const job = jobs.find((entry) => entry.id === item.jobId);
                  return (
                    <tr key={item.id}>
                      <td className="p-4">
                        <p className="font-semibold">{item.candidate.fullName}</p>
                        <p className="text-xs text-slate-500">{item.candidate.email}</p>
                        {item.candidate.phone && (
                          <p className="text-xs text-slate-500">{item.candidate.phone}</p>
                        )}
                      </td>
                      <td className="p-4">{job?.title ?? "Unknown job"}</td>
                      <td className="p-4">
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                          {item.stage}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-xl font-bold">Add candidate</h2>

            <div>
              <label className="mb-1 block text-sm font-medium">Full name</label>
              <input
                required minLength={2} maxLength={120}
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="w-full rounded-xl border p-3 text-sm"
                placeholder="Candidate full name"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                required type="email" maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border p-3 text-sm"
                placeholder="candidate@example.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Phone (optional)</label>
              <input
                maxLength={30}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="w-full rounded-xl border p-3 text-sm"
                placeholder="Phone number"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Apply for job</label>
              <select
                required value={jobId}
                onChange={(event) => setJobId(event.target.value)}
                className="w-full rounded-xl border bg-white p-3 text-sm"
              >
                <option value="">Select a job</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id} disabled={job.status !== "OPEN"}>
                    {job.title} — {job.location}{job.status === "CLOSED" ? " (Closed)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={submitting}
                className="rounded-xl border px-4 py-2.5 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {submitting ? "Adding..." : "Add candidate"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
