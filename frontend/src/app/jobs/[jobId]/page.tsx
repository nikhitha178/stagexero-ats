
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    BriefcaseBusiness,
    MapPin,
    Users,
    Bot,
    Send,
    Loader2,
    CheckCircle2,
    XCircle,
    Clock,
    Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

type ApplicationStage =
    | "APPLIED"
    | "SCREENING"
    | "INTERVIEW"
    | "OFFER"
    | "HIRED"
    | "REJECTED";

type Job = {
    id: string;
    title: string;
    location: string;
    status: "OPEN" | "CLOSED";
    createdAt: string;
    _count?: {
        applications: number;
    };
};

type Candidate = {
    id: string;
    stage: ApplicationStage;
    createdAt: string;
    candidate: {
        id: string;
        fullName: string;
        email: string;
    };
};

type StageChangeProposal = {
    type: "stage_change";
    applicationId: string;
    candidateName: string;
    currentStage: ApplicationStage;
    newStage: ApplicationStage;
};

type ApplicationListProposal = {
    type: "application_list";
    applications: {
        id: string;
        candidateName: string;
        email: string;
        stage: ApplicationStage;
    }[];
};

type ErrorProposal = {
    type: "error";
    applicationId?: string;
    candidateName?: string;
    message: string;
};

type Proposal =
    | StageChangeProposal
    | ApplicationListProposal
    | ErrorProposal;

type ChatMessage = {
    role: "user" | "assistant";
    content: string;
    proposals?: Proposal[];
};

const STAGES: ApplicationStage[] = [
    "APPLIED",
    "SCREENING",
    "INTERVIEW",
    "OFFER",
    "HIRED",
    "REJECTED",
];

const stageColors: Record<ApplicationStage, string> = {
    APPLIED: "bg-slate-100 text-slate-700",
    SCREENING: "bg-blue-100 text-blue-700",
    INTERVIEW: "bg-purple-100 text-purple-700",
    OFFER: "bg-amber-100 text-amber-700",
    HIRED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-red-100 text-red-700",
};

export default function JobDetailsPage() {
    const params = useParams<{ jobId: string }>();
    const router = useRouter();
    const jobId = params.jobId;

    const [job, setJob] = useState<Job | null>(null);
    const [applications, setApplications] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [question, setQuestion] = useState("");
    const [asking, setAsking] = useState(false);
    const [confirmingId, setConfirmingId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: "assistant",
            content:
                "Hi! I'm your AI recruiting assistant. Ask me about candidates for this job, their application stages, or request a stage change. I'll always ask for your confirmation before changing anything.",
        },
    ]);

    const loadJobDetails = useCallback(async () => {
        try {
            setLoading(true);

            const [jobResponse, applicationsResponse] = await Promise.all([
                api.get(`/jobs/${jobId}`),
                api.get(`/jobs/${jobId}/applications`),
            ]);

            setJob(jobResponse.data.data);
            setApplications(applicationsResponse.data.data);
        } catch (error) {
            console.error("Failed to load job details:", error);
            toast.error("Unable to load job details.");
        } finally {
            setLoading(false);
        }
    }, [jobId]);

    useEffect(() => {
        if (jobId) {
            void loadJobDetails();
        }
    }, [jobId, loadJobDetails]);

    const askCopilot = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedQuestion = question.trim();

        if (!trimmedQuestion || asking) return;

        setMessages((previous) => [
            ...previous,
            { role: "user", content: trimmedQuestion },
        ]);

        setQuestion("");
        setAsking(true);

        try {
            const response = await api.post(`/jobs/${jobId}/copilot`, {
                question: trimmedQuestion,
            });

            const result = response.data.data;

            setMessages((previous) => [
                ...previous,
                {
                    role: "assistant",
                    content: result.answer || "I couldn't generate an answer.",
                    proposals: result.proposals || [],
                },
            ]);
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                "The AI assistant is temporarily unavailable. Please try again.";

            setMessages((previous) => [
                ...previous,
                {
                    role: "assistant",
                    content: message,
                },
            ]);
        } finally {
            setAsking(false);
        }
    };

    const confirmStageChange = async (proposal: StageChangeProposal) => {
        if (confirmingId) return;

        try {
            setConfirmingId(proposal.applicationId);

            const response = await api.post(
                `/jobs/${jobId}/copilot/confirm`,
                {
                    applicationId: proposal.applicationId,
                    newStage: proposal.newStage,
                }
            );

            const updatedApplication = response.data.data.application;

            setApplications((previous) =>
                previous.map((application) =>
                    application.id === proposal.applicationId
                        ? { ...application, ...updatedApplication }
                        : application
                )
            );

            setMessages((previous) =>
                previous.map((message) => ({
                    ...message,
                    proposals: message.proposals?.filter(
                        (item) =>
                            !(
                                item.type === "stage_change" &&
                                item.applicationId === proposal.applicationId
                            )
                    ),
                }))
            );

            toast.success(
                `${proposal.candidateName}'s stage updated to ${proposal.newStage}.`
            );
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                "Unable to update the candidate stage."
            );
        } finally {
            setConfirmingId(null);
        }
    };

    const cancelProposal = (
        proposal: StageChangeProposal
    ) => {
        setMessages((previous) =>
            previous.map((message) => ({
                ...message,
                proposals: message.proposals?.filter(
                    (item) =>
                        !(
                            item.type === "stage_change" &&
                            item.applicationId === proposal.applicationId
                        )
                ),
            }))
        );

        toast.info("Stage change cancelled.");
    };

    const stageCounts = STAGES.map((stage) => ({
        stage,
        count: applications.filter((application) => application.stage === stage)
            .length,
    }));

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-semibold text-slate-800">
                    Job not found
                </h2>
                <Link
                    href="/jobs"
                    className="mt-4 inline-block text-sm font-medium text-indigo-600"
                >
                    Back to Jobs
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <button
                onClick={() => router.push("/jobs")}
                className="flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
            >
                <ArrowLeft size={17} />
                Back to Jobs
            </button>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <span className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
                                <BriefcaseBusiness size={22} />
                            </span>
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${job.status === "OPEN"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-slate-100 text-slate-600"
                                    }`}
                            >
                                {job.status}
                            </span>
                        </div>

                        <h1 className="text-2xl font-bold text-slate-900">
                            {job.title}
                        </h1>

                        <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                            <MapPin size={16} />
                            {job.location}
                        </p>
                    </div>

                    <div className="rounded-xl bg-indigo-50 px-5 py-4">
                        <p className="text-sm text-indigo-600">Total Applications</p>
                        <p className="mt-1 text-3xl font-bold text-indigo-900">
                            {applications.length}
                        </p>
                    </div>
                </div>
            </section>

            <section>
                <div className="mb-4 flex items-center gap-2">
                    <Users size={20} className="text-indigo-600" />
                    <h2 className="text-lg font-bold text-slate-900">
                        Application Pipeline
                    </h2>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {stageCounts.map(({ stage, count }) => (
                        <div
                            key={stage}
                            className="rounded-xl border border-slate-200 bg-white p-4"
                        >
                            <p className="text-xs font-medium text-slate-500">{stage}</p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                {count}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-5">
                    <h2 className="font-bold text-slate-900">Candidates</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        All candidates who applied for {job.title}.
                    </p>
                </div>

                {applications.length === 0 ? (
                    <div className="p-10 text-center text-sm text-slate-500">
                        No applications received yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                <tr>
                                    <th className="px-5 py-4">Candidate</th>
                                    <th className="px-5 py-4">Email</th>
                                    <th className="px-5 py-4">Applied On</th>
                                    <th className="px-5 py-4">Current Stage</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {applications.map((application) => (
                                    <tr key={application.id} className="hover:bg-slate-50">
                                        <td className="px-5 py-4 font-medium text-slate-900">
                                            {application.candidate.fullName}
                                        </td>
                                        <td className="px-5 py-4 text-slate-500">
                                            {application.candidate.email}
                                        </td>
                                        <td className="px-5 py-4 text-slate-500">
                                            {new Date(application.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${stageColors[application.stage]
                                                    }`}
                                            >
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

            <section className="overflow-hidden rounded-2xl border border-indigo-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 bg-indigo-600 p-5 text-white">
                    <div className="rounded-xl bg-white/15 p-2">
                        <Bot size={23} />
                    </div>
                    <div>
                        <h2 className="font-bold">AI Recruiting Copilot</h2>
                        <p className="text-xs text-indigo-100">
                            Ask questions and manage candidates with AI assistance.
                        </p>
                    </div>
                    <Sparkles className="ml-auto" size={21} />
                </div>

                <div className="flex h-[420px] flex-col">
                    <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-5">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`max-w-[90%] rounded-2xl p-4 text-sm ${message.role === "user"
                                        ? "bg-indigo-600 text-white"
                                        : "border border-slate-200 bg-white text-slate-700 shadow-sm"
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap">{message.content}</p>

                                    {message.proposals?.map((proposal, proposalIndex) => {
                                        if (proposal.type === "stage_change") {
                                            return (
                                                <div
                                                    key={proposalIndex}
                                                    className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-slate-800"
                                                >
                                                    <p className="flex items-center gap-2 font-semibold">
                                                        <Clock size={16} />
                                                        Stage change proposed
                                                    </p>
                                                    <p className="mt-2 text-sm">
                                                        <strong>{proposal.candidateName}</strong>
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-600">
                                                        {proposal.currentStage} → {proposal.newStage}
                                                    </p>
                                                    <p className="mt-2 text-xs text-slate-500">
                                                        This action will update the candidate's stage.
                                                        Please confirm before proceeding.
                                                    </p>
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        <button
                                                            onClick={() =>
                                                                void confirmStageChange(proposal)
                                                            }
                                                            disabled={confirmingId !== null}
                                                            className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                                                        >
                                                            {confirmingId === proposal.applicationId ? (
                                                                <Loader2 size={14} className="animate-spin" />
                                                            ) : (
                                                                <CheckCircle2 size={14} />
                                                            )}
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() => cancelProposal(proposal)}
                                                            disabled={confirmingId !== null}
                                                            className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                                                        >
                                                            <XCircle size={14} />
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        if (proposal.type === "application_list") {
                                            return (
                                                <div
                                                    key={proposalIndex}
                                                    className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700"
                                                >
                                                    <p className="mb-2 font-semibold">
                                                        Candidates found: {proposal.applications.length}
                                                    </p>
                                                    {proposal.applications.map((candidate) => (
                                                        <div
                                                            key={candidate.id}
                                                            className="border-t border-slate-200 py-2"
                                                        >
                                                            <p className="font-medium">
                                                                {candidate.candidateName}
                                                            </p>
                                                            <p className="text-slate-500">
                                                                {candidate.email} · {candidate.stage}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        }

                                        return (
                                            <p
                                                key={proposalIndex}
                                                className="mt-2 text-xs text-red-600"
                                            >
                                                {proposal.message}
                                            </p>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {asking && (
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Loader2 size={16} className="animate-spin" />
                                AI is thinking...
                            </div>
                        )}
                    </div>

                    <form
                        onSubmit={askCopilot}
                        className="flex items-center gap-3 border-t border-slate-200 p-4"
                    >
                        <input
                            value={question}
                            onChange={(event) => setQuestion(event.target.value)}
                            placeholder="Ask about candidates or request a stage change..."
                            maxLength={1000}
                            disabled={asking}
                            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
                        />
                        <button
                            type="submit"
                            disabled={!question.trim() || asking}
                            className="flex items-center justify-center rounded-xl bg-indigo-600 p-3 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {asking ? (
                                <Loader2 size={19} className="animate-spin" />
                            ) : (
                                <Send size={19} />
                            )}
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
}
