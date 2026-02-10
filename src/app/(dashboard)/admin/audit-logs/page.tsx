"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

type AuditLog = {
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    meta: any;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    } | null;
};

type AuditLogsResponse = {
    logs: AuditLog[];
    total: number;
    uniqueActions: string[];
    uniqueEntities: string[];
};

export default function AuditLogsPage() {
    const [data, setData] = useState<AuditLogsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const [actionFilter, setActionFilter] = useState("");
    const [entityFilter, setEntityFilter] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [searchUser, setSearchUser] = useState("");

    const [page, setPage] = useState(0);
    const pageSize = 50;

    useEffect(() => {
        fetchLogs();
    }, [actionFilter, entityFilter, dateFrom, dateTo, page]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (actionFilter) params.set("action", actionFilter);
            if (entityFilter) params.set("entity", entityFilter);
            if (dateFrom) params.set("from", new Date(dateFrom).toISOString());
            if (dateTo) params.set("to", new Date(dateTo).toISOString());
            params.set("limit", pageSize.toString());
            params.set("offset", (page * pageSize).toString());

            const result = await apiFetch<AuditLogsResponse>(
                `/api/admin/audit-logs?${params.toString()}`
            );
            setData(result);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setActionFilter("");
        setEntityFilter("");
        setDateFrom("");
        setDateTo("");
        setSearchUser("");
        setPage(0);
    };

    const hasFilters = actionFilter || entityFilter || dateFrom || dateTo || searchUser;

    const filteredLogs = data?.logs.filter((log) => {
        if (searchUser) {
            const query = searchUser.toLowerCase();
            return (
                log.user?.name.toLowerCase().includes(query) ||
                log.user?.email.toLowerCase().includes(query)
            );
        }
        return true;
    }) || [];

    const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div className="absolute top-20 left-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

            <div className="relative z-10 p-6 space-y-6 max-w-[1600px] mx-auto">
                <div className="flex items-start justify-between">
                    <div className="animate-fade-in-down">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-2xl shadow-orange-500/30">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-cyan-700 bg-clip-text text-transparent">
                                    Audit Log Viewer
                                </h1>
                                <p className="text-gray-600 mt-1">Complete system activity tracking and monitoring</p>
                            </div>
                        </div>
                    </div>
                    <Link
                        href="/admin"
                        className="px-6 py-3 text-sm border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:text-blue-600 hover:shadow-lg transition-all font-semibold backdrop-blur-sm bg-white/80"
                    >
                        Back to Dashboard
                    </Link>
                </div>

                <div className="card-animated backdrop-blur-sm bg-white/90">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            <h2 className="text-xl font-bold text-gray-900">Advanced Filters</h2>
                        </div>
                        {hasFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-red-600 hover:text-red-700 font-semibold flex items-center gap-2 hover:scale-105 transition-transform"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Clear All Filters
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Action Type
                            </label>
                            <select
                                value={actionFilter}
                                onChange={(e) => {
                                    setActionFilter(e.target.value);
                                    setPage(0);
                                }}
                                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                            >
                                <option value="">All Actions</option>
                                {data?.uniqueActions.map((action) => (
                                    <option key={action} value={action}>
                                        {action}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Entity Type
                            </label>
                            <select
                                value={entityFilter}
                                onChange={(e) => {
                                    setEntityFilter(e.target.value);
                                    setPage(0);
                                }}
                                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                            >
                                <option value="">All Entities</option>
                                {data?.uniqueEntities.map((entity) => (
                                    <option key={entity} value={entity}>
                                        {entity}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Date From
                            </label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => {
                                    setDateFrom(e.target.value);
                                    setPage(0);
                                }}
                                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Date To
                            </label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => {
                                    setDateTo(e.target.value);
                                    setPage(0);
                                }}
                                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Search User
                            </label>
                            <input
                                type="text"
                                value={searchUser}
                                onChange={(e) => setSearchUser(e.target.value)}
                                placeholder="Name or email..."
                                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="card-animated backdrop-blur-sm bg-white/90">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Activity Log</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Showing {filteredLogs.length} of {data?.total || 0} entries
                            </p>
                        </div>
                        {data && totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(Math.max(0, page - 1))}
                                    disabled={page === 0}
                                    className="px-4 py-2 border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 text-sm font-semibold text-gray-700">
                                    Page {page + 1} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                                    disabled={page >= totalPages - 1}
                                    className="px-4 py-2 border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="text-center py-16">
                            <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <div className="text-gray-500 mt-4 font-semibold">Loading audit logs...</div>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">📋</div>
                            <div className="text-gray-500 font-semibold">No audit logs found</div>
                            {hasFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
                                >
                                    Clear filters to see all logs
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Timestamp</th>
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Action</th>
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Entity</th>
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">User</th>
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLogs.map((log) => (
                                        <AuditLogRow key={log.id} log={log} />
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

function AuditLogRow({ log }: { log: AuditLog }) {
    const [expanded, setExpanded] = useState(false);

    const getActionColor = (action: string) => {
        if (action.includes("LOGIN")) return "from-green-500 to-emerald-500";
        if (action.includes("UPLOAD")) return "from-blue-500 to-cyan-500";
        if (action.includes("DOWNLOAD")) return "from-orange-500 to-amber-500";
        if (action.includes("DELETE") || action.includes("DEACTIVATE")) return "from-red-500 to-rose-500";
        if (action.includes("UPDATE") || action.includes("STATUS")) return "from-yellow-500 to-orange-500";
        if (action.includes("CREATE")) return "from-green-500 to-teal-500";
        return "from-gray-500 to-gray-600";
    };

    const getEntityIcon = (entity: string) => {
        if (entity === "DOCUMENT") return "📄";
        if (entity === "FILE") return "📎";
        if (entity === "USER") return "👤";
        if (entity === "DIVISION") return "🏢";
        return "📦";
    };

    return (
        <>
            <tr className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all group">
                <td className="py-4 px-4">
                    <div className="text-sm font-semibold text-gray-900">
                        {new Date(log.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })}
                    </div>
                    <div className="text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                        })}
                    </div>
                </td>
                <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r ${getActionColor(log.action)} shadow-md`}>
                        {log.action}
                    </span>
                </td>
                <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{getEntityIcon(log.entity)}</span>
                        <div>
                            <div className="font-semibold text-gray-900">{log.entity}</div>
                            {log.entityId && (
                                <div className="text-xs text-gray-500 font-mono">{log.entityId.slice(0, 8)}</div>
                            )}
                        </div>
                    </div>
                </td>
                <td className="py-4 px-4">
                    {log.user ? (
                        <div>
                            <div className="font-semibold text-gray-900">{log.user.name}</div>
                            <div className="text-xs text-gray-500">{log.user.email}</div>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${
                                log.user.role === "ADMIN"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-blue-100 text-blue-700"
                            }`}>
                                {log.user.role}
                            </span>
                        </div>
                    ) : (
                        <span className="text-gray-400 italic text-sm">System</span>
                    )}
                </td>
                <td className="py-4 px-4">
                    {log.meta && Object.keys(log.meta).length > 0 ? (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-semibold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                        >
                            <svg className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            View Details
                        </button>
                    ) : (
                        <span className="text-gray-400 italic text-sm">No details</span>
                    )}
                </td>
            </tr>
            {expanded && log.meta && (
                <tr>
                    <td colSpan={5} className="py-4 px-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-100">
                        <div className="p-4 bg-white rounded-xl border-2 border-blue-200 shadow-inner">
                            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Metadata Details
                            </h4>
                            <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-x-auto border border-gray-200 font-mono text-gray-800">
{JSON.stringify(log.meta, null, 2)}
                            </pre>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
