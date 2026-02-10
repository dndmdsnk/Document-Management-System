"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AssignDocumentModal from "./AssignDocumentModal";
import ChangeDivisionModal from "./ChangeDivisionModal";
import UpdateStatusModal from "./UpdateStatusModal";

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
        note: string | null;
        createdAt: string;
    } | null;
    statuses: Array<{
        id: string;
        name: string;
        note: string | null;
        createdAt: string;
        createdBy: {
            id: string;
            name: string;
            email: string;
        };
    }>;
    files: Array<{
        id: string;
        originalName: string;
        mimeType: string;
        sizeBytes: number;
        createdAt: string;
    }>;
    assignments: Array<{
        id: string;
        status: string;
        dueDate: string | null;
        note: string | null;
        createdAt: string;
        assignee: {
            id: string;
            name: string;
            email: string;
        };
        assignedBy: {
            id: string;
            name: string;
            email: string;
        };
    }>;
    createdBy: {
        id: string;
        name: string;
        email: string;
    };
};

export default function DocumentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [document, setDocument] = useState<Document | null>(null);
    const [loading, setLoading] = useState(true);

    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [changeDivisionModalOpen, setChangeDivisionModalOpen] = useState(false);
    const [updateStatusModalOpen, setUpdateStatusModalOpen] = useState(false);

    const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

    useEffect(() => {
        fetchDocument();
    }, [params.id]);

    const fetchDocument = async () => {
        setLoading(true);
        try {
            const data = await apiFetch<{ doc: Document }>(`/api/documents/${params.id}`);
            setDocument(data.doc);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const downloadFile = async (fileId: string) => {
        try {
            const data = await apiFetch<{ url: string }>(`/api/files/${fileId}/download`);
            window.open(data.url, "_blank");
        } catch (error) {
            console.error(error);
            showNotification("error", "Failed to download file");
        }
    };

    const showNotification = (type: "success" | "error", message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
                <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!document) {
        return (
            <div className="p-6">
                <div className="text-red-600">Document not found</div>
            </div>
        );
    }

    const overdueAssignments = document.assignments.filter(
        (a) => a.status === "OPEN" && a.dueDate && new Date(a.dueDate) < new Date()
    );

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

            <div className="relative z-10 p-6 space-y-6 max-w-[1600px] mx-auto">
                <div className="flex items-start justify-between animate-fade-in-down">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-cyan-700 bg-clip-text text-transparent">
                                {document.letterNo}
                            </h1>
                            <p className="text-gray-600 mt-1">Document Details & Management</p>
                        </div>
                    </div>
                    <Link
                        href="/admin/documents"
                        className="px-6 py-3 text-sm border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:text-blue-600 hover:shadow-lg transition-all font-semibold backdrop-blur-sm bg-white/80"
                    >
                        Back to Documents
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card-animated backdrop-blur-sm bg-white/90">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Document Information</h2>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setChangeDivisionModalOpen(true)}
                                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
                                    >
                                        Change Division
                                    </button>
                                    <button
                                        onClick={() => setUpdateStatusModalOpen(true)}
                                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
                                    >
                                        Update Status
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <InfoRow label="Letter Number" value={document.letterNo} />
                                <InfoRow label="Subject" value={document.subject || "No subject"} />
                                <InfoRow label="From" value={document.fromName || "N/A"} />
                                <InfoRow label="To" value={document.toName || "N/A"} />
                                <InfoRow
                                    label="Division"
                                    value={
                                        <Link
                                            href={`/admin/divisions/${document.division.id}`}
                                            className="text-blue-600 hover:text-blue-700 hover:underline font-semibold"
                                        >
                                            {document.division.name}
                                        </Link>
                                    }
                                />
                                <InfoRow
                                    label="Current Status"
                                    value={
                                        document.currentStatus ? (
                                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-green-500 to-emerald-500 shadow-md">
                                                {document.currentStatus.name}
                                            </span>
                                        ) : (
                                            "No status"
                                        )
                                    }
                                />
                                <InfoRow
                                    label="Created By"
                                    value={
                                        <div>
                                            <div className="font-semibold">{document.createdBy.name}</div>
                                            <div className="text-sm text-gray-500">{document.createdBy.email}</div>
                                        </div>
                                    }
                                />
                                <InfoRow
                                    label="Created At"
                                    value={new Date(document.createdAt).toLocaleString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                />
                            </div>
                        </div>

                        <div className="card-animated backdrop-blur-sm bg-white/90">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Status Timeline</h2>
                                <span className="text-sm text-gray-500">{document.statuses.length} updates</span>
                            </div>

                            {document.statuses.length > 0 ? (
                                <div className="space-y-4">
                                    {document.statuses.map((status, idx) => (
                                        <StatusTimelineItem
                                            key={status.id}
                                            status={status}
                                            isLatest={idx === document.statuses.length - 1}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">No status updates yet</div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="card-animated backdrop-blur-sm bg-white/90">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Attachments</h2>
                                <span className="text-sm text-gray-500">{document.files.length} files</span>
                            </div>

                            {document.files.length > 0 ? (
                                <div className="space-y-3">
                                    {document.files.map((file) => (
                                        <FileItem key={file.id} file={file} onDownload={() => downloadFile(file.id)} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">No files attached</div>
                            )}
                        </div>

                        <div className="card-animated backdrop-blur-sm bg-white/90">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Assignments</h2>
                                <button
                                    onClick={() => setAssignModalOpen(true)}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
                                >
                                    Assign
                                </button>
                            </div>

                            {overdueAssignments.length > 0 && (
                                <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="text-sm font-semibold text-red-800">
                                            {overdueAssignments.length} overdue assignment{overdueAssignments.length > 1 ? "s" : ""}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {document.assignments.length > 0 ? (
                                <div className="space-y-3">
                                    {document.assignments.map((assignment) => (
                                        <AssignmentItem key={assignment.id} assignment={assignment} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">No assignments yet</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {assignModalOpen && (
                <AssignDocumentModal
                    documentId={document.id}
                    divisionId={document.division.id}
                    onClose={() => setAssignModalOpen(false)}
                    onSuccess={() => {
                        setAssignModalOpen(false);
                        showNotification("success", "Document assigned successfully");
                        fetchDocument();
                    }}
                    onError={(msg) => showNotification("error", msg)}
                />
            )}

            {changeDivisionModalOpen && (
                <ChangeDivisionModal
                    document={document}
                    onClose={() => setChangeDivisionModalOpen(false)}
                    onSuccess={() => {
                        setChangeDivisionModalOpen(false);
                        showNotification("success", "Division changed successfully");
                        fetchDocument();
                    }}
                    onError={(msg) => showNotification("error", msg)}
                />
            )}

            {updateStatusModalOpen && (
                <UpdateStatusModal
                    documentId={document.id}
                    onClose={() => setUpdateStatusModalOpen(false)}
                    onSuccess={() => {
                        setUpdateStatusModalOpen(false);
                        showNotification("success", "Status updated successfully");
                        fetchDocument();
                    }}
                    onError={(msg) => showNotification("error", msg)}
                />
            )}
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start gap-4 py-3 border-b border-gray-100">
            <div className="text-sm font-semibold text-gray-600 w-32 flex-shrink-0">{label}</div>
            <div className="text-sm text-gray-900 flex-1">{value}</div>
        </div>
    );
}

function StatusTimelineItem({
    status,
    isLatest,
}: {
    status: {
        id: string;
        name: string;
        note: string | null;
        createdAt: string;
        createdBy: { name: string; email: string };
    };
    isLatest: boolean;
}) {
    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div className={`w-4 h-4 rounded-full ${isLatest ? "bg-green-500 ring-4 ring-green-100" : "bg-gray-300"}`} />
                {!isLatest && <div className="w-0.5 h-full bg-gray-200 mt-1" />}
            </div>
            <div className="flex-1 pb-6">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <div className="font-bold text-gray-900">{status.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                            by {status.createdBy.name} on{" "}
                            {new Date(status.createdAt).toLocaleString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </div>
                    </div>
                    {isLatest && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                            Current
                        </span>
                    )}
                </div>
                {status.note && (
                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {status.note}
                    </div>
                )}
            </div>
        </div>
    );
}

function FileItem({
    file,
    onDownload,
}: {
    file: {
        id: string;
        originalName: string;
        mimeType: string;
        sizeBytes: number;
        createdAt: string;
    };
    onDownload: () => void;
}) {
    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    return (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">{file.originalName}</div>
                <div className="text-xs text-gray-500">{formatSize(file.sizeBytes)}</div>
            </div>
            <button
                onClick={onDownload}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all opacity-0 group-hover:opacity-100"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
            </button>
        </div>
    );
}

function AssignmentItem({
    assignment,
}: {
    assignment: {
        id: string;
        status: string;
        dueDate: string | null;
        note: string | null;
        createdAt: string;
        assignee: { name: string; email: string };
        assignedBy: { name: string; email: string };
    };
}) {
    const isOverdue = assignment.status === "OPEN" && assignment.dueDate && new Date(assignment.dueDate) < new Date();

    return (
        <div className={`p-4 rounded-xl border-2 ${isOverdue ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`}>
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <div className="font-bold text-gray-900">{assignment.assignee.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{assignment.assignee.email}</div>
                </div>
                <span className={`px-2 py-1 text-xs font-bold rounded ${
                    assignment.status === "DONE"
                        ? "bg-green-100 text-green-700"
                        : isOverdue
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                }`}>
                    {assignment.status === "DONE" ? "Done" : isOverdue ? "Overdue" : "Open"}
                </span>
            </div>
            {assignment.dueDate && (
                <div className={`text-sm ${isOverdue ? "text-red-700 font-semibold" : "text-gray-600"}`}>
                    Due: {new Date(assignment.dueDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })}
                </div>
            )}
            {assignment.note && (
                <div className="mt-2 text-xs text-gray-600">{assignment.note}</div>
            )}
            <div className="mt-2 text-xs text-gray-500">
                Assigned by {assignment.assignedBy.name} on{" "}
                {new Date(assignment.createdAt).toLocaleDateString()}
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
