
"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
    ArrowRight,
    BriefcaseBusiness,
    Check,
    ChevronDown,
    Loader2,
    RefreshCw,
    Search,
    Users,
    X,
} from "lucide-react";
import api from "@/lib/api";

const STAGES = [
    "APPLIED",
    "SCREENING",
    "INTERVIEW",
    "OFFER",
    "HIRED",
    "REJECTED",
] as const;

type Stage = (typeof STAGES)[number];

type Candidate = {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
};

type Application = {
    id: string;
    jobId: string;
    stage: Stage;
    createdAt: string;
    candidate: Candidate;
};

type Job = {
    id: string;
    title: string;
    status: "OPEN" | "CLOSED";
};

const NEXT_STAGES: Record<Stage, Stage[]> = {
    APPLIED: ["SCREENING", "REJECTED"],
    SCREENING: ["INTERVIEW", "REJECTED"],
    INTERVIEW: ["OFFER", "REJECTED"],
    OFFER: ["HIRED", "REJECTED"],
    HIRED: [],
    REJECTED: [],
};

const STAGE_LABELS: Record<Stage, string> = {
    APPLIED: "Applied",
    SCREENING: "Screening",
    INTERVIEW: "Interview",
    OFFER: "Offer",
    HIRED: "Hired",
    REJECTED: "Rejected",
};

const STAGE_STYLES: Record<Stage, string> = {
    APPLIED: "bg-slate-100 text-slate-700",
    SCREENING: "bg-blue-100 text-blue-700",
    INTERVIEW: "bg-violet-100 text-violet-700",
    OFFER: "bg-amber-100 text-amber-700",
    HIRED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-red-100 text-red-700",
};

export default function PipelinePage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [selectedJob, setSelectedJob] = useState("ALL");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [pending, setPending] = useState<{
        application: Application;
        nextStage: Stage;
    } | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);

        try {
            const jobsResponse = await api.get("/jobs");
            const jobList: Job[] = jobsResponse.data.data ?? jobsResponse.data;
            setJobs(jobList);

            const responses = await Promise.all(
                jobList.map((job) =>
                    api.get(`/jobs/${job.id}/applications`),
                ),
            );

            const allApplications: Application[] = responses.flatMap(
                (response) => response.data.data ?? response.data,
            );

            setApplications(allApplications);
        } catch (error) {
            console.error("Pipeline loading failed:", error);
            toast.error("Unable to load the hiring pipeline.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const filteredApplications = applications.filter((application) => {
        const matchesJob =
            selectedJob === "ALL" || application.jobId === selectedJob;

        const query = search.trim().toLowerCase();
        const matchesSearch =
            !query ||
            application.candidate.fullName.toLowerCase().includes(query) ||
            application.candidate.email.toLowerCase().includes(query);

        return matchesJob && matchesSearch;
    });

    const confirmStageUpdate = async () => {
        if (!pending || updating) return;

        setUpdating(true);

        try {
            await api.patch(`/applications/${pending.application.id}/stage`, {
                stage: pending.nextStage,
            });

            toast.success(
                `${pending.application.candidate.fullName} moved to ${STAGE_LABELS[pending.nextStage]}.`,
            );

            setPending(null);
            await loadData();
        } catch (error: any) {
            console.error("Stage update failed:", error);
            toast.error(
                error.response?.data?.message || "Unable to update the application stage.",
            );
        } finally {
            setUpdating(false);
        }
    };

    const totalApplications = filteredApplications.length;
    const totalCandidates = new Set(
        filteredApplications.map((application) => application.candidate.email),
    ).size;

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p className="text-sm font-medium text-blue-600">Recruitment</p>
                    <h1 className="mt-1 text-2xl font-bold text-slate-900">
                        Hiring Pipeline
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Track candidates through every stage of your hiring process.
                    </p>
                </div>

                <button
                    onClick={() => void loadData()}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">Total applications</p>
                        <BriefcaseBusiness className="text-blue-600" size={20} />
                    </div>
                    <p className="mt-3 text-2xl font-bold text-slate-900">
                        {totalApplications}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">Unique candidates</p>
                        <Users className="text-violet-600" size={20} />
                    </div>
                    <p className="mt-3 text-2xl font-bold text-slate-900">
                        {totalCandidates}
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row">
                <div className="relative flex-1">
                    <Search
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search candidate name or email..."
                        className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
                    />
                </div>

                <select
                    value={selectedJob}
                    onChange={(event) => setSelectedJob(event.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                    <option value="ALL">All jobs</option>
                    {jobs.map((job) => (
                        <option key={job.id} value={job.id}>
                            {job.title}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-20 text-slate-500">
                    <Loader2 className="mr-2 animate-spin" size={20} />
                    Loading pipeline...
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                    {STAGES.map((stage) => {
                        const stageApplications = filteredApplications.filter(
                            (application) => application.stage === stage,
                        );

                        return (
                            <section
                                key={stage}
                                className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3"
                            >
                                <div className="mb-3 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-sm font-bold text-slate-800">
                                            {STAGE_LABELS[stage]}
                                        </h2>
                                        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-600">
                                            {stageApplications.length}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {stageApplications.map((application) => {
                                        const job = jobs.find(
                                            (item) => item.id === application.jobId,
                                        );

                                        const allowedStages = NEXT_STAGES[stage];

                                        return (
                                            <article
                                                key={application.id}
                                                className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <h3 className="truncate text-sm font-semibold text-slate-900">
                                                            {application.candidate.fullName}
                                                        </h3>
                                                        <p className="mt-1 break-all text-xs text-slate-500">
                                                            {application.candidate.email}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${STAGE_STYLES[stage]}`}
                                                    >
                                                        {STAGE_LABELS[stage]}
                                                    </span>
                                                </div>

                                                <div className="mt-3 border-t border-slate-100 pt-2">
                                                    <p className="truncate text-xs text-slate-600">
                                                        {job?.title ?? "Unknown job"}
                                                    </p>
                                                    <p className="mt-1 text-[11px] text-slate-400">
                                                        Applied{" "}
                                                        {new Date(application.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>

                                                {allowedStages.length > 0 ? (
                                                    <div className="mt-3">
                                                        <label className="mb-1 block text-[11px] font-medium text-slate-500">
                                                            Move candidate to
                                                        </label>
                                                        <select
                                                            value=""
                                                            onChange={(event) => {
                                                                const nextStage = event.target.value as Stage;
                                                                if (nextStage) {
                                                                    setPending({ application, nextStage });
                                                                }
                                                            }}
                                                            className="w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-xs outline-none focus:border-blue-500"
                                                        >
                                                            <option value="">Select stage</option>
                                                            {allowedStages.map((nextStage) => (
                                                                <option key={nextStage} value={nextStage}>
                                                                    {STAGE_LABELS[nextStage]}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                ) : (
                                                    <p className="mt-3 text-[11px] font-medium text-slate-400">
                                                        <Check size={13} className="mr-1 inline" />
                                                        Final stage
                                                    </p>
                                                )}
                                            </article>
                                        );
                                    })}

                                    {stageApplications.length === 0 && (
                                        <p className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-6 text-center text-xs text-slate-400">
                                            No candidates
                                        </p>
                                    )}
                                </div>
                            </section>
                        );
                    })}
                </div>
            )}

            {pending && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="stage-confirm-title"
                        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <h2
                                    id="stage-confirm-title"
                                    className="text-lg font-bold text-slate-900"
                                >
                                    Confirm stage update
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Review this candidate movement before saving.
                                </p>
                            </div>
                            <button
                                onClick={() => setPending(null)}
                                disabled={updating}
                                aria-label="Close dialog"
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <div className="my-5 rounded-lg bg-slate-50 p-4">
                            <p className="font-semibold text-slate-900">
                                {pending.application.candidate.fullName}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                {STAGE_LABELS[pending.application.stage]}
                                <ArrowRight className="mx-2 inline" size={14} />
                                {STAGE_LABELS[pending.nextStage]}
                            </p>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setPending(null)}
                                disabled={updating}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => void confirmStageUpdate()}
                                disabled={updating}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {updating && <Loader2 size={15} className="animate-spin" />}
                                Confirm update
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
