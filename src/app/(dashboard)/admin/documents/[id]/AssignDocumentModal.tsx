"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
};

type Props = {
    documentId: string;
    divisionId: string;
    onClose: () => void;
    onSuccess: () => void;
    onError: (message: string) => void;
};

export default function AssignDocumentModal({
    documentId,
    divisionId,
    onClose,
    onSuccess,
    onError,
}: Props) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [selectedUserId, setSelectedUserId] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [note, setNote] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await apiFetch<{ users: User[] }>("/api/admin/users");
            const divisionUsers = data.users.filter((u) => u.role === "STAFF");
            setUsers(divisionUsers);
        } catch (error) {
            console.error(error);
            onError("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedUserId) {
            onError("Please select a user");
            return;
        }

        setSubmitting(true);
        try {
            await apiFetch(`/api/documents/${documentId}/assign`, {
                method: "POST",
                body: JSON.stringify({
                    assigneeId: selectedUserId,
                    dueDate: dueDate || undefined,
                    note: note || undefined,
                }),
            });
            onSuccess();
        } catch (error: any) {
            onError(error.message || "Failed to assign document");
        } finally {
            setSubmitting(false);
        }
    };

    const selectedUser = users.find((u) => u.id === selectedUserId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
                <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-cyan-500 p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Assign Document</h2>
                                <p className="text-blue-100 text-sm mt-1">Assign this document to a staff member</p>
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
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <div className="text-gray-500 mt-2">Loading users...</div>
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Select User <span className="text-red-500">*</span>
                                </label>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {users.map((user) => (
                                        <label
                                            key={user.id}
                                            className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                                selectedUserId === user.id
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name="user"
                                                    value={user.id}
                                                    checked={selectedUserId === user.id}
                                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                                    className="w-5 h-5 text-blue-500 focus:ring-blue-500"
                                                />
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    <div className={`font-semibold ${
                                                        selectedUserId === user.id ? "text-blue-900" : "text-gray-900"
                                                    }`}>
                                                        {user.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">{user.email}</div>
                                                </div>
                                                {selectedUserId === user.id && (
                                                    <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {selectedUser && (
                                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-semibold text-blue-800">
                                                Selected: {selectedUser.name}
                                            </p>
                                            <p className="text-xs text-blue-600 mt-1">{selectedUser.email}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Due Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    min={new Date().toISOString().split("T")[0]}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Note (Optional)
                                </label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    rows={4}
                                    placeholder="Add any additional notes or instructions..."
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all resize-none"
                                />
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
                                    disabled={submitting || !selectedUserId}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Assigning...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Assign Document
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
