"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

type ReportType = "DOCUMENTS_BY_DIVISION" | "STATUS_SUMMARY" | "OVERDUE_ASSIGNMENTS" | "ACTIVITY_REPORT";

type Division = {
    id: string;
    name: string;
};

type ReportData = {
    reportType: string;
    filters: any;
    data: any[];
    summary: any;
};

export default function ReportsPage() {
    const [reportType, setReportType] = useState<ReportType>("DOCUMENTS_BY_DIVISION");
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [exporting, setExporting] = useState<string | null>(null);

    const [filters, setFilters] = useState({
        divisionId: "ALL",
        status: "ALL",
        dateFrom: "",
        dateTo: "",
        assignedStaff: "",
        timeRange: "MONTHLY" as "WEEKLY" | "MONTHLY" | "CUSTOM",
    });

    const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

    useEffect(() => {
        fetchDivisions();
    }, []);

    const fetchDivisions = async () => {
        try {
            const data = await apiFetch<{ divisions: Division[] }>("/api/admin/divisions");
            setDivisions(data.divisions);
        } catch (error) {
            console.error(error);
        }
    };

    const generateReport = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("reportType", reportType);
            if (filters.divisionId !== "ALL") params.set("divisionId", filters.divisionId);
            if (filters.status !== "ALL") params.set("status", filters.status);
            if (filters.dateFrom) params.set("dateFrom", new Date(filters.dateFrom).toISOString());
            if (filters.dateTo) params.set("dateTo", new Date(filters.dateTo).toISOString());
            if (filters.assignedStaff) params.set("assignedStaff", filters.assignedStaff);
            if (filters.timeRange) params.set("timeRange", filters.timeRange);

            const data = await apiFetch<ReportData>(`/api/admin/reports/generate?${params.toString()}`);
            setReportData(data);
        } catch (error: any) {
            showNotification("error", error.message || "Failed to generate report");
        } finally {
            setLoading(false);
        }
    };

    const exportReport = async (format: "EXCEL" | "PDF") => {
        if (!reportData) return;

        setExporting(format);
        try {
            const response = await fetch("/api/admin/reports/export", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    format,
                    reportType: reportData.reportType,
                    filters: reportData.filters,
                    data: reportData.data,
                }),
            });

            if (!response.ok) {
                throw new Error("Export failed");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `report_${reportType}_${Date.now()}.${format === "EXCEL" ? "xlsx" : "pdf"}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showNotification("success", `Report exported as ${format} successfully`);
        } catch (error: any) {
            showNotification("error", error.message || "Failed to export report");
        } finally {
            setExporting(null);
        }
    };

    const showNotification = (type: "success" | "error", message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    const reportTypes = [
        { value: "DOCUMENTS_BY_DIVISION", label: "Documents by Division", icon: "📊" },
        { value: "STATUS_SUMMARY", label: "Status Summary", icon: "📈" },
        { value: "OVERDUE_ASSIGNMENTS", label: "Overdue Assignments", icon: "⏰" },
        { value: "ACTIVITY_REPORT", label: "Activity Report", icon: "📉" },
    ];

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
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/30">
                            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-emerald-700 bg-clip-text text-transparent">
                                Reports & Analytics
                            </h1>
                            <p className="text-gray-600 mt-1">Generate and export comprehensive system reports</p>
                        </div>
                    </div>
                    <Link
                        href="/admin"
                        className="px-6 py-3 text-sm border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:text-blue-600 hover:shadow-lg transition-all font-semibold backdrop-blur-sm bg-white/80"
                    >
                        Back to Dashboard
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {reportTypes.map((type) => (
                        <button
                            key={type.value}
                            onClick={() => setReportType(type.value as ReportType)}
                            className={`card-animated backdrop-blur-sm relative overflow-hidden group hover:scale-105 transition-all ${
                                reportType === type.value
                                    ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-2xl shadow-green-500/30"
                                    : "bg-white/90 hover:shadow-xl"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`text-4xl ${reportType === type.value ? "scale-110" : ""} transition-transform`}>
                                    {type.icon}
                                </div>
                                <div className="text-left">
                                    <div className={`text-sm font-bold ${reportType === type.value ? "text-white" : "text-gray-900"}`}>
                                        {type.label}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="card-animated backdrop-blur-sm bg-white/90">
                    <div className="flex items-center gap-3 mb-6">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <h2 className="text-xl font-bold text-gray-900">Report Filters</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {reportType !== "OVERDUE_ASSIGNMENTS" && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Time Range
                                </label>
                                <select
                                    value={filters.timeRange}
                                    onChange={(e) => setFilters({ ...filters, timeRange: e.target.value as any })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all"
                                >
                                    <option value="WEEKLY">Weekly</option>
                                    <option value="MONTHLY">Monthly</option>
                                    <option value="CUSTOM">Custom Range</option>
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Division
                            </label>
                            <select
                                value={filters.divisionId}
                                onChange={(e) => setFilters({ ...filters, divisionId: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all"
                            >
                                <option value="ALL">All Divisions</option>
                                {divisions.map((div) => (
                                    <option key={div.id} value={div.id}>
                                        {div.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {reportType !== "ACTIVITY_REPORT" && reportType !== "OVERDUE_ASSIGNMENTS" && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="RECEIVED">Received</option>
                                    <option value="UNDER REVIEW">Under Review</option>
                                    <option value="APPROVED">Approved</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                            </div>
                        )}

                        {filters.timeRange === "CUSTOM" && (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Date From
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.dateFrom}
                                        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Date To
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.dateTo}
                                        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="mt-6 flex items-center justify-end">
                        <button
                            onClick={generateReport}
                            disabled={loading}
                            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Generate Report
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {reportData && (
                    <div className="card-animated backdrop-blur-sm bg-white/90 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Report Results</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {reportData.data.length} records found
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => exportReport("EXCEL")}
                                    disabled={exporting !== null}
                                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {exporting === "EXCEL" ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Exporting...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Export Excel
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => exportReport("PDF")}
                                    disabled={exporting !== null}
                                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {exporting === "PDF" ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Exporting...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                            Export PDF
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {reportData.summary && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                {Object.entries(reportData.summary).map(([key, value]) => (
                                    <div key={key} className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-blue-200">
                                        <div className="text-sm font-semibold text-gray-600 mb-1">
                                            {key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">{String(value)}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        {reportData.data[0] && Object.keys(reportData.data[0]).map((key) => (
                                            <th key={key} className="text-left py-4 px-4 text-sm font-bold text-gray-700">
                                                {key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.data.map((row, idx) => (
                                        <tr key={idx} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all">
                                            {Object.values(row).map((value, vidx) => (
                                                <td key={vidx} className="py-3 px-4 text-sm text-gray-900">
                                                    {String(value)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
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
