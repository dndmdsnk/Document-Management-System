"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

type User = {
    id: string;
    name: string;
    email: string;
    division: { id: string; name: string } | null;
};

type Division = {
    id: string;
    name: string;
};

type Props = {
    user: User;
    divisions: Division[];
    onClose: () => void;
    onSuccess: () => void;
    onError: (message: string) => void;
};

export default function ChangeDivisionModal({ user, divisions, onClose, onSuccess, onError }: Props) {
    const [divisionId, setDivisionId] = useState(user.division?.id || "");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!divisionId) {
            onError("Please select a division");
            return;
        }

        setLoading(true);
        try {
            await apiFetch(`/api/admin/users/${user.id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    divisionId: divisionId,
                }),
            });
            onSuccess();
        } catch (error: any) {
            onError(error.message || "Failed to change division");
        } finally {
            setLoading(false);
        }
    };

    const selectedDivision = divisions.find(d => d.id === divisionId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in-up">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Change Division</h2>
                                <p className="text-green-100 text-sm mt-1">Reassign user to a different division</p>
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
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-600">{user.email}</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                            <div className="text-xs font-semibold text-red-600 mb-2">Current Division</div>
                            <div className="font-bold text-red-900">
                                {user.division ? user.division.name : "No division"}
                            </div>
                        </div>
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                            <div className="text-xs font-semibold text-green-600 mb-2">New Division</div>
                            <div className="font-bold text-green-900">
                                {selectedDivision ? selectedDivision.name : "Select division"}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Select New Division <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {divisions.map((division) => (
                                <label
                                    key={division.id}
                                    className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                        divisionId === division.id
                                            ? "border-green-500 bg-green-50"
                                            : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="division"
                                            value={division.id}
                                            checked={divisionId === division.id}
                                            onChange={(e) => setDivisionId(e.target.value)}
                                            className="w-5 h-5 text-green-500 focus:ring-green-500"
                                        />
                                        <div className="flex-1">
                                            <div className={`font-semibold ${
                                                divisionId === division.id ? "text-green-900" : "text-gray-900"
                                            }`}>
                                                {division.name}
                                            </div>
                                            {division.id === user.division?.id && (
                                                <div className="text-xs text-red-600 mt-1">Current division</div>
                                            )}
                                        </div>
                                        {divisionId === division.id && (
                                            <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-blue-800">Division Change Notice</p>
                            <p className="text-xs text-blue-600 mt-1">
                                The user will be reassigned to the new division. This action will be logged in audit logs.
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
                            disabled={loading || !divisionId || divisionId === user.division?.id}
                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
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
                </form>
            </div>
        </div>
    );
}
