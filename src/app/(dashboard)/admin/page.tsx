"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

type DashboardStats = {
    totalDocuments: number;
    statusCounts: Record<string, number>;
    overdueAssignments: number;
    documentsToday: number;
    documentsThisWeek: number;
    downloadsToday: number;
    downloadsThisWeek: number;
    activeUsers: number;
    documentsByDivision: Array<{ divisionId: string; divisionName: string; count: number }>;
};

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch<DashboardStats>("/api/admin/dashboard")
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Loading dashboard...</div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="p-6">
                <div className="text-red-600">Failed to load dashboard</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-1">Overview of system metrics and quick actions</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Documents"
                    value={stats.totalDocuments}
                    icon="📄"
                    color="blue"
                />
                <StatCard
                    title="Documents This Week"
                    value={stats.documentsThisWeek}
                    subtitle={`${stats.documentsToday} today`}
                    icon="📅"
                    color="green"
                />
                <StatCard
                    title="Overdue Assignments"
                    value={stats.overdueAssignments}
                    icon="⚠️"
                    color="red"
                />
                <StatCard
                    title="Active Users"
                    value={stats.activeUsers}
                    icon="👥"
                    color="cyan"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card-animated">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents by Status</h2>
                    <div className="space-y-3">
                        {Object.entries(stats.statusCounts).map(([status, count]) => (
                            <StatusBar key={status} label={status} count={count} />
                        ))}
                        {Object.keys(stats.statusCounts).length === 0 && (
                            <div className="text-center text-gray-500 py-4">No documents yet</div>
                        )}
                    </div>
                </div>

                <div className="card-animated">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Downloads Activity</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                            <div>
                                <div className="text-sm text-gray-600">Today</div>
                                <div className="text-2xl font-bold text-blue-600">{stats.downloadsToday}</div>
                            </div>
                            <div className="text-3xl">📥</div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                            <div>
                                <div className="text-sm text-gray-600">This Week</div>
                                <div className="text-2xl font-bold text-green-600">{stats.downloadsThisWeek}</div>
                            </div>
                            <div className="text-3xl">📊</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-animated">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents by Division</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Division</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Documents</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.documentsByDivision.map((div, idx) => (
                                <tr key={div.divisionId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4">
                                        <Link href={`/admin/divisions/${div.divisionId}`} className="text-blue-600 hover:text-blue-700 hover:underline">
                                            {div.divisionName}
                                        </Link>
                                    </td>
                                    <td className="py-3 px-4 text-right font-semibold text-gray-900">{div.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {stats.documentsByDivision.length === 0 && (
                        <div className="text-center text-gray-500 py-8">No documents yet</div>
                    )}
                </div>
            </div>

            <div className="card-animated">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <QuickActionButton
                        href="/admin/divisions"
                        icon="🏢"
                        label="Manage Divisions"
                        description="View and manage all divisions"
                    />
                    <QuickActionButton
                        href="/admin/users"
                        icon="👤"
                        label="Manage Users"
                        description="Create and manage staff accounts"
                    />
                    <QuickActionButton
                        href="/admin/audit-logs"
                        icon="📋"
                        label="View Audit Logs"
                        description="Track system activity"
                    />
                </div>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    subtitle,
    icon,
    color,
}: {
    title: string;
    value: number;
    subtitle?: string;
    icon: string;
    color: "blue" | "green" | "red" | "cyan";
}) {
    const colorClasses = {
        blue: "from-blue-500 to-blue-600 shadow-blue-100",
        green: "from-green-500 to-green-600 shadow-green-100",
        red: "from-red-500 to-red-600 shadow-red-100",
        cyan: "from-cyan-500 to-cyan-600 shadow-cyan-100",
    };

    return (
        <div className="card-animated relative overflow-hidden">
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-sm text-gray-600 mb-1">{title}</div>
                    <div className="text-3xl font-bold text-gray-900">{value}</div>
                    {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-2xl shadow-lg`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function StatusBar({ label, count }: { label: string; count: number }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{label}</span>
                <span className="font-semibold text-gray-900">{count}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((count / 10) * 100, 100)}%` }}
                />
            </div>
        </div>
    );
}

function QuickActionButton({
    href,
    icon,
    label,
    description,
}: {
    href: string;
    icon: string;
    label: string;
    description: string;
}) {
    return (
        <Link
            href={href}
            className="block p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-200 group"
        >
            <div className="flex items-start gap-3">
                <div className="text-3xl group-hover:scale-110 transition-transform">{icon}</div>
                <div>
                    <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{label}</div>
                    <div className="text-xs text-gray-500 mt-1">{description}</div>
                </div>
            </div>
        </Link>
    );
}
