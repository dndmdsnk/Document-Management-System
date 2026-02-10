"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

type Division = {
    id: string;
    name: string;
};

type Document = {
    id: string;
    letterNo: string;
    division: {
        id: string;
        name: string;
    };
};

type Props = {
    document: Document;
    onClose: () => void;
    onSuccess: () => void;
    onError: (message: string) => void;
};

export default function ChangeDivisionModal({ document, onClose, onSuccess, onError }: Props) {
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedDivisionId, setSelectedDivisionId] = useState(document.division.id);

    useEffect(() => {
        fetchDivisions();
    }, []);

    const fetchDivisions = async () => {
        setLoading(true);
        try {
            const data = await apiFetch<{ divisions: Division[] }>("/api/admin/divisions");
            setDivisions(data.divisions);
        } catch (error) {
            console.error(error);
            onError("Failed to load divisions");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDivisionId || selectedDivisionId === document.division.id) {
            onError("Please select a different division");
            return;
        }

        setSubmitting(true);
        try {
            await apiFetch(`/api/admin/documents/${document.id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    divisionId: selectedDivisionId,
                }),
            });
            onSuccess();
        } catch (error: any) {
            onError(error.message || "Failed to change division");
        } finally {
            setSubmitting(false);
        }
    };

    const selectedDivision = divisions.find((d) => d.id === selectedDivisionId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in-up">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Change Division</h2>
                                <p className="text-orange-100 text-sm mt-1">Move document to another division</p>
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
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                        <div className="text-xs font-semibold text-gray-600 mb-2">Document</div>
                        <div className="font-bold text-gray-900">{document.letterNo}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                            <div className="text-xs font-semibold text-red-600 mb-2">Current Division</div>
                            <div className="font-bold text-red-900">{document.division.name}</div>
                        </div>
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                            <div className="text-xs font-semibold text-green-600 mb-2">New Division</div>
                            <div className="font-bold text-green-900">
                                {selectedDivision ? selectedDivision.name : "Select division"}
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                            <div className="text-gray-500 mt-2">Loading divisions...</div>
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Select New Division <span className="text-red-500">*</span>
                                </label>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {divisions.map((division) => (
                                        <label
                                            key={division.id}
                                            className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                                selectedDivisionId === division.id
                                                    ? "border-green-500 bg-green-50"
                                                    : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name="division"
                                                    value={division.id}
                                                    checked={selectedDivisionId === division.id}
                                                    onChange={(e) => setSelectedDivisionId(e.target.value)}
                                                    className="w-5 h-5 text-green-500 focus:ring-green-500"
                                                />
                                                <div className="flex-1">
                                                    <div className={`font-semibold ${
                                                        selectedDivisionId === division.id ? "text-green-900" : "text-gray-900"
                                                    }`}>
                                                        {division.name}
                                                    </div>
                                                    {division.id === document.division.id && (
                                                        <div className="text-xs text-red-600 mt-1">Current division</div>
                                                    )}
                                                </div>
                                                {selectedDivisionId === division.id && (
                                                    <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 flex items-start gap-3">
                                <svg className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-orange-800">Division Change Notice</p>
                                    <p className="text-xs text-orange-600 mt-1">
                                        This will move the document to a different division. This action will be logged in audit logs.
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
                                    disabled={submitting || !selectedDivisionId || selectedDivisionId === document.division.id}
                                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Changing...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Change Division
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}
