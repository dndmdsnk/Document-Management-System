"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

type User = {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    division: { id: string; name: string } | null;
    createdAt: string;
};

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch<{ users: User[] }>("/api/admin/users")
            .then((data) => setUsers(data.users))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500 mt-1">Manage system users and staff</p>
                </div>
                <Link
                    href="/admin"
                    className="px-4 py-2 text-sm border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all"
                >
                    ← Back to Dashboard
                </Link>
            </div>

            {loading ? (
                <div className="card-animated text-center py-12">
                    <div className="text-gray-500">Loading users...</div>
                </div>
            ) : (
                <div className="card-animated">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
                        <span className="text-sm text-gray-500">{users.length} total</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Division</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 font-medium text-gray-900">{user.name}</td>
                                        <td className="py-3 px-4 text-gray-600">{user.email}</td>
                                        <td className="py-3 px-4 text-gray-600">
                                            {user.division ? (
                                                <Link href={`/admin/divisions/${user.division.id}`} className="text-blue-600 hover:underline">
                                                    {user.division.name}
                                                </Link>
                                            ) : (
                                                <span className="text-gray-400">No division</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold ${
                                                user.role === "ADMIN"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-blue-100 text-blue-700"
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold ${
                                                user.isActive
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-700"
                                            }`}>
                                                {user.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
