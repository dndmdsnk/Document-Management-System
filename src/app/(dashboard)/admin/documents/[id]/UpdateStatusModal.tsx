"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

type Props = {
    documentId: string;
    onClose: () => void;
    onSuccess: () => void;
    onError: (message: string) => void;
};

const STATUS_OPTIONS = [
    "RECEIVED",
    "UNDER REVIEW",
    "PENDING APPROVAL",
    "APPROVED",
    "REJECTED",
    "FORWARDED",
    "COMPLETED",
    "ARCHIVED",
];

export default function UpdateStatusModal({ documentId, onClose, onSuccess, onError }: Props) {
    const [statusName, setStatusName] = useState("");
    const [note, setNote] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [customStatus, setCustomStatus] = useState("");
    const [useCustom, setUseCustom] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const finalStatus = useCustom ? customStatus : statusName;

        if (!finalStatus.trim()) {
            onError("Please enter a status");
            return;
        }

        setSubmitting(true);
        try {
            await apiFetch(`/api/documents/${documentId}/status`, {
                method: "POST",
                body: JSON.stringify({
                    name: finalStatus,
                    note: note || undefined,
                }),
            });
            onSuccess();
        } catch (error: any) {
            onError(error.message || "Failed to update status");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in-up">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Update Status</h2>
                                <p className="text-green-100 text-sm mt-1">Add a new status update to this document</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-all"
                        >
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="flex items-center gap-4 pb-4 border-b-2 border-gray-100">
                        <button
                            type="button"
                            onClick={() => setUseCustom(false)}
                            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                                !useCustom
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            Preset Status
                        </button>
                        <button
                            type="button"
                            onClick={() => setUseCustom(true)}
                            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                                useCustom
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            Custom Status
                        </button>
                    </div>

                    {!useCustom ? (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Select Status <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {STATUS_OPTIONS.map((status) => (
                                    <label
                                        key={status}
                                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all text-center ${
                                            statusName === status
                                                ? "border-green-500 bg-green-50"
                                                : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="status"
                                            value={status}
                                            checked={statusName === status}
                                            onChange={(e) => setStatusName(e.target.value)}
                                            className="sr-only"
                                        />
                                        <div className={`text-sm font-semibold ${
                                            statusName === status ? "text-green-900" : "text-gray-900"
                                        }`}>
                                            {status}
                                        </div>
                                        {statusName === status && (
                                            <div className="mt-2">
                                                <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Custom Status Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={customStatus}
                                onChange={(e) => setCustomStatus(e.target.value)}
                                placeholder="Enter custom status name..."
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Note (Optional)
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={4}
                            placeholder="Add any additional notes about this status update..."
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-blue-800">Status Update</p>
                            <p className="text-xs text-blue-600 mt-1">
                                This will add a new status entry to the document timeline and update the current status.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || (!statusName && !customStatus)}
                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Update Status
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
