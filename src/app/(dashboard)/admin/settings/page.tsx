"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

type Settings = {
    statusWorkflow: string[];
    fileUploadMaxSize: number;
    allowedFileTypes: string[];
    retentionPeriodDays: number;
    notificationsEnabled: boolean;
    emailNotifications: boolean;
    systemMaintenance: boolean;
};

export default function SystemSettingsPage() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [editMode, setEditMode] = useState<string | null>(null);
    const [tempValue, setTempValue] = useState<any>(null);

    const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const data = await apiFetch<Settings>("/api/admin/settings");
            setSettings(data);
        } catch (error: any) {
            showNotification("error", error.message || "Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const saveSetting = async (key: string, value: any) => {
        setSaving(true);
        try {
            await apiFetch("/api/admin/settings", {
                method: "PATCH",
                body: JSON.stringify({ [key]: value }),
            });
            showNotification("success", "Settings updated successfully");
            setEditMode(null);
            fetchSettings();
        } catch (error: any) {
            showNotification("error", error.message || "Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const showNotification = (type: "success" | "error", message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    if (loading || !settings) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
                <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div className="absolute top-20 left-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}

            <div className="relative z-10 p-6 space-y-6 max-w-[1400px] mx-auto">
                <div className="flex items-start justify-between animate-fade-in-down">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-gray-800 flex items-center justify-center shadow-2xl shadow-gray-500/30">
                            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-slate-800 to-gray-700 bg-clip-text text-transparent">
                                System Settings
                            </h1>
                            <p className="text-gray-600 mt-1">Configure system-wide preferences and policies</p>
                        </div>
                    </div>
                    <Link
                        href="/admin"
                        className="px-6 py-3 text-sm border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:text-blue-600 hover:shadow-lg transition-all font-semibold backdrop-blur-sm bg-white/80"
                    >
                        Back to Dashboard
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SettingCard
                        title="Status Workflow"
                        description="Define available document statuses"
                        icon="📊"
                        color="blue"
                    >
                        <div className="space-y-2">
                            {settings.statusWorkflow.map((status, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200"
                                >
                                    <span className="font-semibold text-gray-900">{status}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 text-sm text-gray-500">
                            Default workflow statuses are configured. Contact system administrator to modify.
                        </div>
                    </SettingCard>

                    <SettingCard
                        title="File Upload Settings"
                        description="Configure file upload restrictions"
                        icon="📁"
                        color="green"
                    >
                        <div className="space-y-4">
                            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                                <div className="text-sm font-semibold text-gray-700 mb-2">Maximum File Size</div>
                                {editMode === "fileUploadMaxSize" ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={tempValue}
                                            onChange={(e) => setTempValue(parseInt(e.target.value))}
                                            className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                                            placeholder="Size in MB"
                                        />
                                        <button
                                            onClick={() => saveSetting("fileUploadMaxSize", tempValue)}
                                            disabled={saving}
                                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setEditMode(null)}
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-bold text-gray-900">
                                            {settings.fileUploadMaxSize} MB
                                        </span>
                                        <button
                                            onClick={() => {
                                                setEditMode("fileUploadMaxSize");
                                                setTempValue(settings.fileUploadMaxSize);
                                            }}
                                            className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                                <div className="text-sm font-semibold text-gray-700 mb-2">Allowed File Types</div>
                                <div className="flex flex-wrap gap-2">
                                    {settings.allowedFileTypes.map((type) => (
                                        <span
                                            key={type}
                                            className="px-3 py-1 bg-white border-2 border-green-300 text-green-700 rounded-lg text-xs font-bold"
                                        >
                                            {type}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </SettingCard>

                    <SettingCard
                        title="Data Retention"
                        description="Configure document retention policies"
                        icon="🗄️"
                        color="orange"
                    >
                        <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200">
                            <div className="text-sm font-semibold text-gray-700 mb-2">Retention Period</div>
                            {editMode === "retentionPeriodDays" ? (
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={tempValue}
                                        onChange={(e) => setTempValue(parseInt(e.target.value))}
                                        className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                                        placeholder="Days"
                                    />
                                    <button
                                        onClick={() => saveSetting("retentionPeriodDays", tempValue)}
                                        disabled={saving}
                                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditMode(null)}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-gray-900">
                                        {settings.retentionPeriodDays} days
                                    </span>
                                    <button
                                        onClick={() => {
                                            setEditMode("retentionPeriodDays");
                                            setTempValue(settings.retentionPeriodDays);
                                        }}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="mt-4 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <p className="text-xs text-yellow-800">
                                    Documents older than the retention period will be automatically archived.
                                </p>
                            </div>
                        </div>
                    </SettingCard>

                    <SettingCard
                        title="Notifications"
                        description="Configure system notifications"
                        icon="🔔"
                        color="purple"
                    >
                        <div className="space-y-4">
                            <ToggleSetting
                                label="Enable Notifications"
                                description="Allow system to send notifications"
                                value={settings.notificationsEnabled}
                                onChange={(val) => saveSetting("notificationsEnabled", val)}
                                disabled={saving}
                            />

                            <ToggleSetting
                                label="Email Notifications"
                                description="Send notifications via email"
                                value={settings.emailNotifications}
                                onChange={(val) => saveSetting("emailNotifications", val)}
                                disabled={saving || !settings.notificationsEnabled}
                            />
                        </div>
                    </SettingCard>

                    <SettingCard
                        title="System Maintenance"
                        description="System-wide controls"
                        icon="🔧"
                        color="red"
                    >
                        <ToggleSetting
                            label="Maintenance Mode"
                            description="Enable to restrict system access during maintenance"
                            value={settings.systemMaintenance}
                            onChange={(val) => saveSetting("systemMaintenance", val)}
                            disabled={saving}
                            dangerous
                        />
                        <div className="mt-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <p className="text-xs text-red-800">
                                    When enabled, only administrators can access the system.
                                </p>
                            </div>
                        </div>
                    </SettingCard>

                    <SettingCard
                        title="System Information"
                        description="Current system status"
                        icon="ℹ️"
                        color="slate"
                    >
                        <div className="space-y-3">
                            <InfoRow label="System Version" value="1.0.0" />
                            <InfoRow label="Database" value="PostgreSQL" />
                            <InfoRow label="Storage" value="AWS S3" />
                            <InfoRow label="Last Updated" value={new Date().toLocaleDateString()} />
                        </div>
                    </SettingCard>
                </div>
            </div>
        </div>
    );
}

function SettingCard({
    title,
    description,
    icon,
    color,
    children,
}: {
    title: string;
    description: string;
    icon: string;
    color: "blue" | "green" | "orange" | "purple" | "red" | "slate";
    children: React.ReactNode;
}) {
    const colorClasses = {
        blue: "from-blue-500 to-cyan-500",
        green: "from-green-500 to-emerald-500",
        orange: "from-orange-500 to-amber-500",
        purple: "from-purple-500 to-pink-500",
        red: "from-red-500 to-rose-500",
        slate: "from-slate-500 to-gray-500",
    };

    return (
        <div className="card-animated backdrop-blur-sm bg-white/90">
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-2xl shadow-lg`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
            </div>
            {children}
        </div>
    );
}

function ToggleSetting({
    label,
    description,
    value,
    onChange,
    disabled,
    dangerous,
}: {
    label: string;
    description: string;
    value: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
    dangerous?: boolean;
}) {
    return (
        <div className={`p-4 rounded-xl border-2 transition-all ${
            dangerous
                ? "bg-gradient-to-r from-red-50 to-rose-50 border-red-200"
                : "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200"
        }`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="font-semibold text-gray-900">{label}</div>
                    <div className="text-sm text-gray-600 mt-1">{description}</div>
                </div>
                <button
                    onClick={() => onChange(!value)}
                    disabled={disabled}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all ${
                        value
                            ? dangerous
                                ? "bg-red-600"
                                : "bg-green-500"
                            : "bg-gray-300"
                    } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                    <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            value ? "translate-x-7" : "translate-x-1"
                        }`}
                    />
                </button>
            </div>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-gray-200">
            <span className="text-sm font-semibold text-gray-700">{label}</span>
            <span className="text-sm text-gray-900">{value}</span>
        </div>
    );
}

function Notification({
    type,
    message,
    onClose,
}: {
    type: "success" | "error";
    message: string;
    onClose: () => void;
}) {
    return (
        <div
            className={`fixed top-6 right-6 z-50 flex items-start gap-4 px-6 py-4 rounded-xl shadow-2xl border-2 animate-fade-in-down ${
                type === "success"
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
            }`}
        >
            <div
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    type === "success" ? "bg-green-500" : "bg-red-500"
                }`}
            >
                {type === "success" ? (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                ) : (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                )}
            </div>
            <div className="flex-1">
                <p className={`font-semibold ${type === "success" ? "text-green-800" : "text-red-800"}`}>
                    {message}
                </p>
            </div>
            <button onClick={onClose} className="flex-shrink-0 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>
        </div>
    );
}
