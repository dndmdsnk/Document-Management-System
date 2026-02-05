"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { useParams } from "next/navigation";

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
};

type Division = {
    id: string;
    name: string;
    createdAt: string;
    _count: {
        users: number;
        documents: number;
    };
    users: User[];
};

type DivisionDetails = {
    division: Division;
    statusCounts: Record<string, number>;
};

export default function DivisionDetailPage() {
    const params = useParams();
    const [data, setData] = useState<DivisionDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch<DivisionDetails>(`/api/admin/divisions/${params.id}`)
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [params.id]);

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Loading division details...</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-6">
                <div className="text-red-600">Failed to load division details</div>
            </div>
        );
    }

    const { division, statusCounts } = data;

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-3xl shadow-lg">
                        🏢
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{division.name}</h1>
                        <p className="text-gray-500 mt-1">
                            Created on {new Date(division.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <Link
                    href="/admin/divisions"
                    className="px-4 py-2 text-sm border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all"
                >
                    ← Back to Divisions
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Documents"
                    value={division._count.documents}
                    icon="📄"
                    color="blue"
                />
                <StatCard
                    title="Staff Members"
                    value={division._count.users}
                    icon="👥"
                    color="green"
                />
                <StatCard
                    title="Document Types"
                    value={Object.keys(statusCounts).length}
                    icon="📊"
                    color="cyan"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card-animated">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents by Status</h2>
                    {Object.keys(statusCounts).length > 0 ? (
                        <div className="space-y-3">
                            {Object.entries(statusCounts).map(([status, count]) => (
                                <StatusBar key={status} label={status} count={count} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-8">No documents yet</div>
                    )}
                </div>

                <div className="card-animated">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
                    <div className="space-y-3">
                        <QuickStat
                            label="Active Staff"
                            value={division.users.filter(u => u.isActive).length}
                            total={division._count.users}
                        />
                        <QuickStat
                            label="Inactive Staff"
                            value={division.users.filter(u => !u.isActive).length}
                            total={division._count.users}
                        />
                        <QuickStat
                            label="Admin Users"
                            value={division.users.filter(u => u.role === "ADMIN").length}
                            total={division._count.users}
                        />
                    </div>
                </div>
            </div>

            <div className="card-animated">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Staff Members</h2>
                    <span className="text-sm text-gray-500">{division.users.length} total</span>
                </div>

                {division.users.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {division.users.map((user) => (
                                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 font-medium text-gray-900">{user.name}</td>
                                        <td className="py-3 px-4 text-gray-600">{user.email}</td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold ${
                                                user.role === "ADMIN"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-blue-100 text-blue-700"
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold ${
                                                user.isActive
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-700"
                                            }`}>
                                                {user.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-8">No staff members assigned</div>
                )}
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    icon,
    color,
}: {
    title: string;
    value: number;
    icon: string;
    color: "blue" | "green" | "cyan";
}) {
    const colorClasses = {
        blue: "from-blue-500 to-blue-600",
        green: "from-green-500 to-green-600",
        cyan: "from-cyan-500 to-cyan-600",
    };

    return (
        <div className="card-animated">
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-sm text-gray-600 mb-1">{title}</div>
                    <div className="text-3xl font-bold text-gray-900">{value}</div>
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

function QuickStat({ label, value, total }: { label: string; value: number; total: number }) {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

    return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900">{value}</span>
                <span className="text-xs text-gray-500">({percentage}%)</span>
            </div>
        </div>
    );
}
