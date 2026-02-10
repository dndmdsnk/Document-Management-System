"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

type Document = {
    id: string;
    letterNo: string;
    subject: string | null;
    fromName: string | null;
    toName: string | null;
    createdAt: string;
    division: {
        id: string;
        name: string;
    };
    currentStatus: {
        id: string;
        name: string;
    } | null;
    createdBy: {
        id: string;
        name: string;
        email: string;
    };
    _count: {
        files: number;
        assignments: number;
    };
};

type Division = {
    id: string;
    name: string;
};

export default function DocumentsOversightPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    const [divisionFilter, setDivisionFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [letterNoSearch, setLetterNoSearch] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const [page, setPage] = useState(0);
    const pageSize = 20;

    useEffect(() => {
        fetchDivisions();
    }, []);

    useEffect(() => {
        fetchDocuments();
    }, [divisionFilter, statusFilter, dateFrom, dateTo, page]);

    const fetchDivisions = async () => {
        try {
            const data = await apiFetch<{ divisions: Division[] }>("/api/admin/divisions");
            setDivisions(data.divisions);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (divisionFilter !== "ALL") params.set("divisionId", divisionFilter);
            if (statusFilter !== "ALL") params.set("status", statusFilter);
            if (letterNoSearch) params.set("letterNo", letterNoSearch);
            if (dateFrom) params.set("from", new Date(dateFrom).toISOString());
            if (dateTo) params.set("to", new Date(dateTo).toISOString());
            params.set("limit", pageSize.toString());
            params.set("offset", (page * pageSize).toString());

            const data = await apiFetch<{ documents: Document[]; total: number }>(
                `/api/admin/documents?${params.toString()}`
            );
            setDocuments(data.documents);
            setTotal(data.total);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPage(0);
        fetchDocuments();
    };

    const clearFilters = () => {
        setDivisionFilter("ALL");
        setStatusFilter("ALL");
        setLetterNoSearch("");
        setDateFrom("");
        setDateTo("");
        setPage(0);
    };

    const hasFilters =
        divisionFilter !== "ALL" ||
        statusFilter !== "ALL" ||
        letterNoSearch ||
        dateFrom ||
        dateTo;

    const totalPages = Math.ceil(total / pageSize);

    const uniqueStatuses = Array.from(
        new Set(documents.map((d) => d.currentStatus?.name).filter(Boolean))
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div className="absolute top-20 left-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

            <div className="relative z-10 p-6 space-y-6 max-w-[1800px] mx-auto">
                <div className="flex items-start justify-between animate-fade-in-down">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-cyan-700 bg-clip-text text-transparent">
                                Document Oversight
                            </h1>
                            <p className="text-gray-600 mt-1">Comprehensive view of all documents across divisions</p>
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
                    <StatCard title="Total Documents" value={total} icon="📄" color="blue" />
                    <StatCard
                        title="Filtered Results"
                        value={documents.length}
                        icon="🔍"
                        color="green"
                    />
                    <StatCard
                        title="Divisions"
                        value={divisions.length}
                        icon="🏢"
                        color="cyan"
                    />
                    <StatCard
                        title="Active Filters"
                        value={hasFilters ? "Yes" : "No"}
                        icon="⚡"
                        color="orange"
                    />
                </div>

                <div className="card-animated backdrop-blur-sm bg-white/90">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            <h2 className="text-xl font-bold text-gray-900">Search & Filters</h2>
                        </div>
                        {hasFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-red-600 hover:text-red-700 font-semibold flex items-center gap-2 hover:scale-105 transition-transform"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Letter Number
                                </label>
                                <input
                                    type="text"
                                    value={letterNoSearch}
                                    onChange={(e) => setLetterNoSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    placeholder="Search by letter number..."
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Division
                                </label>
                                <select
                                    value={divisionFilter}
                                    onChange={(e) => {
                                        setDivisionFilter(e.target.value);
                                        setPage(0);
                                    }}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                                >
                                    <option value="ALL">All Divisions</option>
                                    {divisions.map((div) => (
                                        <option key={div.id} value={div.id}>
                                            {div.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setPage(0);
                                    }}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                                >
                                    <option value="ALL">All Status</option>
                                    {uniqueStatuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                            <div className="flex items-end">
                                <button
                                    onClick={handleSearch}
                                    className="w-full px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Search
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-animated backdrop-blur-sm bg-white/90">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Documents</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Showing {documents.length} of {total} documents
                            </p>
                        </div>
                        {totalPages > 1 && (
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
                            <div className="text-gray-500 mt-4 font-semibold">Loading documents...</div>
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">📄</div>
                            <div className="text-gray-500 font-semibold">No documents found</div>
                            {hasFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
                                >
                                    Clear filters to see all documents
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Letter No</th>
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Subject</th>
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Division</th>
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Status</th>
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Files</th>
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Assignments</th>
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Created</th>
                                        <th className="text-right py-4 px-4 text-sm font-bold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.map((doc) => (
                                        <DocumentRow key={doc.id} document={doc} />
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
    value: number | string;
    icon: string;
    color: "blue" | "green" | "cyan" | "orange";
}) {
    const colorClasses = {
        blue: "from-blue-500 to-blue-600 shadow-blue-100",
        green: "from-green-500 to-green-600 shadow-green-100",
        cyan: "from-cyan-500 to-cyan-600 shadow-cyan-100",
        orange: "from-orange-500 to-orange-600 shadow-orange-100",
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

function DocumentRow({ document }: { document: Document }) {
    return (
        <tr className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all group">
            <td className="py-4 px-4">
                <Link
                    href={`/admin/documents/${document.id}`}
                    className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                    {document.letterNo}
                </Link>
            </td>
            <td className="py-4 px-4">
                <div className="max-w-xs">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                        {document.subject || "No subject"}
                    </div>
                    {document.fromName && (
                        <div className="text-xs text-gray-500 mt-1">From: {document.fromName}</div>
                    )}
                </div>
            </td>
            <td className="py-4 px-4">
                <Link
                    href={`/admin/divisions/${document.division.id}`}
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
                >
                    {document.division.name}
                </Link>
            </td>
            <td className="py-4 px-4">
                {document.currentStatus ? (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-green-500 to-emerald-500 shadow-md">
                        {document.currentStatus.name}
                    </span>
                ) : (
                    <span className="text-gray-400 italic text-sm">No status</span>
                )}
            </td>
            <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="font-semibold text-gray-900">{document._count.files}</span>
                </div>
            </td>
            <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="font-semibold text-gray-900">{document._count.assignments}</span>
                </div>
            </td>
            <td className="py-4 px-4">
                <div className="text-sm font-semibold text-gray-900">
                    {new Date(document.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })}
                </div>
                <div className="text-xs text-gray-500">by {document.createdBy.name}</div>
            </td>
            <td className="py-4 px-4 text-right">
                <Link
                    href={`/admin/documents/${document.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                    View Details
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </td>
        </tr>
    );
}
