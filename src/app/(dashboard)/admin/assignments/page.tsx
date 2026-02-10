"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

type Assignment = {
    id: string;
    status: string;
    dueDate: string | null;
    note: string | null;
    createdAt: string;
    document: {
        id: string;
        letterNo: string;
        subject: string | null;
        division: {
            id: string;
            name: string;
        };
        currentStatus: {
            id: string;
            name: string;
        } | null;
    };
    assignee: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    assignedBy: {
        id: string;
        name: string;
        email: string;
    };
};

type Division = {
    id: string;
    name: string;
};

export default function AssignmentsOversightPage() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    const [filterType, setFilterType] = useState<"ALL" | "OVERDUE" | "OPEN" | "DONE">("ALL");
    const [divisionFilter, setDivisionFilter] = useState("ALL");

    const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

    useEffect(() => {
        fetchDivisions();
    }, []);

    useEffect(() => {
        fetchAssignments();
    }, [filterType, divisionFilter]);

    const fetchDivisions = async () => {
        try {
            const data = await apiFetch<{ divisions: Division[] }>("/api/admin/divisions");
            setDivisions(data.divisions);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterType !== "ALL") params.set("filter", filterType);
            if (divisionFilter !== "ALL") params.set("divisionId", divisionFilter);

            const data = await apiFetch<{ assignments: Assignment[]; total: number }>(
                `/api/admin/assignments?${params.toString()}`
            );
            setAssignments(data.assignments);
            setTotal(data.total);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const markAsDone = async (assignmentId: string) => {
        try {
            await apiFetch(`/api/admin/assignments/${assignmentId}`, {
                method: "PATCH",
                body: JSON.stringify({ status: "DONE" }),
            });
            showNotification("success", "Assignment marked as done");
            fetchAssignments();
        } catch (error) {
            console.error(error);
            showNotification("error", "Failed to update assignment");
        }
    };

    const showNotification = (type: "success" | "error", message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    const overdueCount = assignments.filter(
        (a) => a.status === "OPEN" && a.dueDate && new Date(a.dueDate) < new Date()
    ).length;

    const openCount = assignments.filter((a) => a.status === "OPEN").length;
    const doneCount = assignments.filter((a) => a.status === "DONE").length;

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

            <div className="relative z-10 p-6 space-y-6 max-w-[1800px] mx-auto">
                <div className="flex items-start justify-between animate-fade-in-down">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl shadow-purple-500/30">
                            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-700 bg-clip-text text-transparent">
                                Assignment Oversight
                            </h1>
                            <p className="text-gray-600 mt-1">Monitor and manage all work assignments</p>
                        </div>
                    </div>
                    <Link
                        href="/admin"
                        className="px-6 py-3 text-sm border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:text-blue-600 hover:shadow-lg transition-all font-semibold backdrop-blur-sm bg-white/80"
                    >
                        Back to Dashboard
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Assignments"
                        value={total}
                        icon="📋"
                        color="blue"
                    />
                    <StatCard
                        title="Open"
                        value={openCount}
                        icon="🔓"
                        color="green"
                    />
                    <StatCard
                        title="Overdue"
                        value={overdueCount}
                        icon="⚠️"
                        color="red"
                    />
                    <StatCard
                        title="Done"
                        value={doneCount}
                        icon="✅"
                        color="cyan"
                    />
                </div>

                <div className="card-animated backdrop-blur-sm bg-white/90">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Status Filter
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {(["ALL", "OPEN", "OVERDUE", "DONE"] as const).map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setFilterType(filter)}
                                        className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                                            filterType === filter
                                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Division
                            </label>
                            <select
                                value={divisionFilter}
                                onChange={(e) => setDivisionFilter(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                            >
                                <option value="ALL">All Divisions</option>
                                {divisions.map((div) => (
                                    <option key={div.id} value={div.id}>
                                        {div.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="card-animated backdrop-blur-sm bg-white/90">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Assignments</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Showing {assignments.length} of {total} assignments
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-16">
                            <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            <div className="text-gray-500 mt-4 font-semibold">Loading assignments...</div>
                        </div>
                    ) : assignments.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">📋</div>
                            <div className="text-gray-500 font-semibold">No assignments found</div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Document</th>
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Division</th>
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Assigned To</th>
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Assigned By</th>
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Due Date</th>
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Status</th>
                                        <th className="text-right py-4 px-4 text-sm font-bold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignments.map((assignment) => (
                                        <AssignmentRow
                                            key={assignment.id}
                                            assignment={assignment}
                                            onMarkDone={() => markAsDone(assignment.id)}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
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
    color: "blue" | "green" | "red" | "cyan";
}) {
    const colorClasses = {
        blue: "from-blue-500 to-blue-600 shadow-blue-100",
        green: "from-green-500 to-green-600 shadow-green-100",
        red: "from-red-500 to-red-600 shadow-red-100",
        cyan: "from-cyan-500 to-cyan-600 shadow-cyan-100",
    };

    return (
        <div className="card-animated backdrop-blur-sm bg-white/90 relative overflow-hidden group hover:scale-105">
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-sm font-semibold text-gray-600 mb-1">{title}</div>
                    <div className="text-3xl font-bold text-gray-900">{value}</div>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function AssignmentRow({
    assignment,
    onMarkDone,
}: {
    assignment: Assignment;
    onMarkDone: () => void;
}) {
    const isOverdue = assignment.status === "OPEN" && assignment.dueDate && new Date(assignment.dueDate) < new Date();

    return (
        <tr className={`border-b border-gray-100 transition-all group ${
            isOverdue ? "bg-red-50 hover:bg-red-100" : "hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50"
        }`}>
            <td className="py-4 px-4">
                <Link
                    href={`/admin/documents/${assignment.document.id}`}
                    className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                    {assignment.document.letterNo}
                </Link>
                {assignment.document.subject && (
                    <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                        {assignment.document.subject}
                    </div>
                )}
            </td>
            <td className="py-4 px-4">
                <Link
                    href={`/admin/divisions/${assignment.document.division.id}`}
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
                >
                    {assignment.document.division.name}
                </Link>
            </td>
            <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {assignment.assignee.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900">{assignment.assignee.name}</div>
                        <div className="text-xs text-gray-500">{assignment.assignee.email}</div>
                    </div>
                </div>
            </td>
            <td className="py-4 px-4">
                <div className="text-sm font-semibold text-gray-900">{assignment.assignedBy.name}</div>
                <div className="text-xs text-gray-500">{assignment.assignedBy.email}</div>
            </td>
            <td className="py-4 px-4">
                {assignment.dueDate ? (
                    <div>
                        <div className={`text-sm font-semibold ${isOverdue ? "text-red-700" : "text-gray-900"}`}>
                            {new Date(assignment.dueDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            })}
                        </div>
                        {isOverdue && (
                            <div className="text-xs text-red-600 font-bold mt-1">
                                {Math.ceil((new Date().getTime() - new Date(assignment.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days overdue
                            </div>
                        )}
                    </div>
                ) : (
                    <span className="text-gray-400 italic text-sm">No due date</span>
                )}
            </td>
            <td className="py-4 px-4">
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md ${
                    assignment.status === "DONE"
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                        : isOverdue
                        ? "bg-gradient-to-r from-red-500 to-rose-500 text-white"
                        : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                }`}>
                    {assignment.status === "DONE" ? "Done" : isOverdue ? "Overdue" : "Open"}
                </span>
            </td>
            <td className="py-4 px-4 text-right">
                <div className="flex items-center justify-end gap-2">
                    <Link
                        href={`/admin/documents/${assignment.document.id}`}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
                    >
                        View
                    </Link>
                    {assignment.status === "OPEN" && (
                        <button
                            onClick={onMarkDone}
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
                        >
                            Mark Done
                        </button>
                    )}
                </div>
            </td>
        </tr>
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
