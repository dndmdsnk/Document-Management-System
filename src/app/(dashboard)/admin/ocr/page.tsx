"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

type Document = {
    id: string;
    letterNo: string;
    subject: string | null;
    ocrText: string | null;
    ocrStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
    createdAt: string;
    division: {
        id: string;
        name: string;
    };
    _count: {
        files: number;
    };
};

type Division = {
    id: string;
    name: string;
};

export default function OCRManagementPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
    const [processing, setProcessing] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Document[]>([]);
    const [searching, setSearching] = useState(false);

    const [filters, setFilters] = useState({
        divisionId: "ALL",
        ocrStatus: "ALL",
    });

    const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, [filters]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [docsData, divsData] = await Promise.all([
                apiFetch<{ documents: Document[] }>(`/api/admin/ocr/documents?divisionId=${filters.divisionId}&ocrStatus=${filters.ocrStatus}`),
                apiFetch<{ divisions: Division[] }>("/api/admin/divisions"),
            ]);
            setDocuments(docsData.documents);
            setDivisions(divsData.divisions);
        } catch (error: any) {
            showNotification("error", error.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const runOCR = async (documentIds: string[]) => {
        setProcessing(true);
        try {
            await apiFetch("/api/admin/ocr/run", {
                method: "POST",
                body: JSON.stringify({ documentIds }),
            });
            showNotification("success", `OCR processing started for ${documentIds.length} document(s)`);
            setSelectedDocs(new Set());
            fetchData();
        } catch (error: any) {
            showNotification("error", error.message || "Failed to start OCR processing");
        } finally {
            setProcessing(false);
        }
    };

    const searchOCR = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const data = await apiFetch<{ documents: Document[] }>(`/api/admin/ocr/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchResults(data.documents);
        } catch (error: any) {
            showNotification("error", error.message || "Search failed");
        } finally {
            setSearching(false);
        }
    };

    const toggleSelectDoc = (docId: string) => {
        const newSelected = new Set(selectedDocs);
        if (newSelected.has(docId)) {
            newSelected.delete(docId);
        } else {
            newSelected.add(docId);
        }
        setSelectedDocs(newSelected);
    };

    const selectAll = () => {
        if (selectedDocs.size === documents.length) {
            setSelectedDocs(new Set());
        } else {
            setSelectedDocs(new Set(documents.map(d => d.id)));
        }
    };

    const showNotification = (type: "success" | "error", message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    const pendingCount = documents.filter(d => d.ocrStatus === "PENDING").length;
    const completedCount = documents.filter(d => d.ocrStatus === "COMPLETED").length;
    const failedCount = documents.filter(d => d.ocrStatus === "FAILED").length;
    const processingCount = documents.filter(d => d.ocrStatus === "PROCESSING").length;

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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-700 bg-clip-text text-transparent">
                                OCR Management
                            </h1>
                            <p className="text-gray-600 mt-1">Optical Character Recognition and full-text search</p>
                        </div>
                    </div>
                    <Link
                        href="/admin"
                        className="px-6 py-3 text-sm border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:text-blue-600 hover:shadow-lg transition-all font-semibold backdrop-blur-sm bg-white/80"
                    >
                        Back to Dashboard
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard title="Pending" value={pendingCount} icon="⏳" color="yellow" />
                    <StatCard title="Processing" value={processingCount} icon="⚙️" color="blue" />
                    <StatCard title="Completed" value={completedCount} icon="✅" color="green" />
                    <StatCard title="Failed" value={failedCount} icon="❌" color="red" />
                </div>

                <div className="card-animated backdrop-blur-sm bg-white/90">
                    <div className="flex items-center gap-3 mb-6">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h2 className="text-xl font-bold text-gray-900">Full-Text Search</h2>
                    </div>

                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && searchOCR()}
                            placeholder="Search in OCR content..."
                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                        />
                        <button
                            onClick={searchOCR}
                            disabled={searching}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {searching ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Search
                                </>
                            )}
                        </button>
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setSearchResults([]);
                                }}
                                className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:border-red-500 hover:text-red-600 transition-all font-semibold"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {searchResults.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                Search Results ({searchResults.length})
                            </h3>
                            <div className="space-y-3">
                                {searchResults.map((doc) => (
                                    <SearchResultCard key={doc.id} document={doc} query={searchQuery} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="card-animated backdrop-blur-sm bg-white/90">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                        </div>
                        {selectedDocs.size > 0 && (
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-gray-600">
                                    {selectedDocs.size} selected
                                </span>
                                <button
                                    onClick={() => runOCR(Array.from(selectedDocs))}
                                    disabled={processing}
                                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {processing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            Run OCR
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Division
                            </label>
                            <select
                                value={filters.divisionId}
                                onChange={(e) => setFilters({ ...filters, divisionId: e.target.value })}
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

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                OCR Status
                            </label>
                            <select
                                value={filters.ocrStatus}
                                onChange={(e) => setFilters({ ...filters, ocrStatus: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                            >
                                <option value="ALL">All Status</option>
                                <option value="PENDING">Pending</option>
                                <option value="PROCESSING">Processing</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="FAILED">Failed</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="card-animated backdrop-blur-sm bg-white/90">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Documents</h2>
                        {documents.length > 0 && (
                            <button
                                onClick={selectAll}
                                className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                            >
                                {selectedDocs.size === documents.length ? "Deselect All" : "Select All"}
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="text-center py-16">
                            <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            <div className="text-gray-500 mt-4 font-semibold">Loading documents...</div>
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">📄</div>
                            <div className="text-gray-500 font-semibold">No documents found</div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="text-left py-4 px-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedDocs.size === documents.length}
                                                onChange={selectAll}
                                                className="w-5 h-5"
                                            />
                                        </th>
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Letter No</th>
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Subject</th>
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Division</th>
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Files</th>
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">OCR Status</th>
                                        <th className="text-right py-4 px-4 text-sm font-bold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.map((doc) => (
                                        <DocumentRow
                                            key={doc.id}
                                            document={doc}
                                            selected={selectedDocs.has(doc.id)}
                                            onToggle={() => toggleSelectDoc(doc.id)}
                                            onRunOCR={() => runOCR([doc.id])}
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
    color: "yellow" | "blue" | "green" | "red";
}) {
    const colorClasses = {
        yellow: "from-yellow-500 to-orange-500 shadow-yellow-100",
        blue: "from-blue-500 to-cyan-500 shadow-blue-100",
        green: "from-green-500 to-emerald-500 shadow-green-100",
        red: "from-red-500 to-rose-500 shadow-red-100",
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

function DocumentRow({
    document,
    selected,
    onToggle,
    onRunOCR,
}: {
    document: Document;
    selected: boolean;
    onToggle: () => void;
    onRunOCR: () => void;
}) {
    const statusColors = {
        PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
        PROCESSING: "bg-blue-100 text-blue-700 border-blue-200",
        COMPLETED: "bg-green-100 text-green-700 border-green-200",
        FAILED: "bg-red-100 text-red-700 border-red-200",
    };

    return (
        <tr className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all">
            <td className="py-4 px-4">
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={onToggle}
                    className="w-5 h-5"
                />
            </td>
            <td className="py-4 px-4">
                <Link
                    href={`/admin/documents/${document.id}`}
                    className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                    {document.letterNo}
                </Link>
            </td>
            <td className="py-4 px-4 text-sm text-gray-900 max-w-xs truncate">
                {document.subject || "No subject"}
            </td>
            <td className="py-4 px-4 text-sm text-gray-600">
                {document.division.name}
            </td>
            <td className="py-4 px-4">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold">
                    {document._count.files}
                </span>
            </td>
            <td className="py-4 px-4">
                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border-2 ${statusColors[document.ocrStatus]}`}>
                    {document.ocrStatus}
                </span>
            </td>
            <td className="py-4 px-4 text-right">
                <button
                    onClick={onRunOCR}
                    disabled={document.ocrStatus === "PROCESSING"}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Run OCR
                </button>
            </td>
        </tr>
    );
}

function SearchResultCard({ document, query }: { document: Document; query: string }) {
    const getHighlightedText = (text: string | null) => {
        if (!text || !query) return text || "";

        const index = text.toLowerCase().indexOf(query.toLowerCase());
        if (index === -1) return text;

        const start = Math.max(0, index - 100);
        const end = Math.min(text.length, index + query.length + 100);
        let snippet = text.substring(start, end);

        if (start > 0) snippet = "..." + snippet;
        if (end < text.length) snippet = snippet + "...";

        return snippet;
    };

    return (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-2">
                <Link
                    href={`/admin/documents/${document.id}`}
                    className="font-bold text-purple-600 hover:text-purple-700 hover:underline text-lg"
                >
                    {document.letterNo}
                </Link>
                <span className="text-xs text-gray-500">{document.division.name}</span>
            </div>
            {document.subject && (
                <div className="text-sm text-gray-700 mb-2">{document.subject}</div>
            )}
            {document.ocrText && (
                <div className="text-sm text-gray-600 bg-white p-3 rounded-lg">
                    {getHighlightedText(document.ocrText)}
                </div>
            )}
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
