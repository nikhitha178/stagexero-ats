
"use client";

import { useState } from "react";
import { Bell, User, Building2, ShieldCheck, Save } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
    const [name, setName] = useState("Recruiter");
    const [email, setEmail] = useState("recruiter@stagexero.com");
    const [workspace, setWorkspace] = useState("StageXero");
    const [notifications, setNotifications] = useState(true);

    const handleSave = () => {
        toast.success("Settings saved for this session.");
    };

    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm font-medium text-indigo-600">Workspace</p>
                <h1 className="mt-1 text-2xl font-bold text-slate-900">
                    Settings
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Manage your workspace preferences and profile.
                </p>
            </div>

            <section className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="mb-5 flex items-center gap-3">
                    <User className="text-indigo-600" size={21} />
                    <div>
                        <h2 className="font-semibold text-slate-900">Profile</h2>
                        <p className="text-xs text-slate-500">
                            Your recruiter account details
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-medium text-slate-700">
                        Full name
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-indigo-500"
                        />
                    </label>

                    <label className="text-sm font-medium text-slate-700">
                        Email address
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-indigo-500"
                        />
                    </label>
                </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="mb-5 flex items-center gap-3">
                    <Building2 className="text-indigo-600" size={21} />
                    <div>
                        <h2 className="font-semibold text-slate-900">Workspace details</h2>
                        <p className="text-xs text-slate-500">
                            Configure your recruitment workspace
                        </p>
                    </div>
                </div>

                <label className="block max-w-md text-sm font-medium text-slate-700">
                    Workspace name
                    <input
                        value={workspace}
                        onChange={(e) => setWorkspace(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-indigo-500"
                    />
                </label>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-3">
                    <Bell className="text-indigo-600" size={21} />
                    <div className="flex-1">
                        <h2 className="font-semibold text-slate-900">Notifications</h2>
                        <p className="text-xs text-slate-500">
                            Enable recruitment notification preferences
                        </p>
                    </div>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={notifications}
                        onClick={() => setNotifications(!notifications)}
                        className={`relative h-6 w-11 rounded-full transition ${notifications ? "bg-indigo-600" : "bg-slate-300"
                            }`}
                    >
                        <span
                            className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${notifications ? "left-6" : "left-1"
                                }`}
                        />
                    </button>
                </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="text-indigo-600" size={21} />
                    <div>
                        <h2 className="font-semibold text-slate-900">Security</h2>
                        <p className="text-xs text-slate-500">
                            Authentication is not configured in this assessment version.
                        </p>
                    </div>
                </div>
            </section>

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                    <Save size={16} />
                    Save settings
                </button>
            </div>
        </div>
    );
}
