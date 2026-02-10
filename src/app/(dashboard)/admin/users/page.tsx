"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import CreateUserModal from "./CreateUserModal";
import ResetPasswordModal from "./ResetPasswordModal";
import ChangeDivisionModal from "./ChangeDivisionModal";

type User = {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    division: { id: string; name: string } | null;
    createdAt: string;
};

type Division = {
    id: string;
    name: string;
};

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "STAFF">("ALL");
    const [divisionFilter, setDivisionFilter] = useState<string>("ALL");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
    const [changeDivisionUser, setChangeDivisionUser] = useState<User | null>(null);

    const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [users, searchQuery, roleFilter, divisionFilter, statusFilter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersData, divisionsData] = await Promise.all([
                apiFetch<{ users: User[] }>("/api/admin/users"),
                apiFetch<{ divisions: Division[] }>("/api/admin/divisions"),
            ]);
            setUsers(usersData.users);
            setDivisions(divisionsData.divisions);
        } catch (error) {
            console.error(error);
            showNotification("error", "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...users];

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (u) =>
                    u.name.toLowerCase().includes(query) ||
                    u.email.toLowerCase().includes(query)
            );
        }

        if (roleFilter !== "ALL") {
            filtered = filtered.filter((u) => u.role === roleFilter);
        }

        if (divisionFilter !== "ALL") {
            filtered = filtered.filter((u) => u.division?.id === divisionFilter);
        }

        if (statusFilter !== "ALL") {
            filtered = filtered.filter((u) =>
                statusFilter === "ACTIVE" ? u.isActive : !u.isActive
            );
        }

        setFilteredUsers(filtered);
    };

    const toggleUserStatus = async (user: User) => {
        try {
            await apiFetch(`/api/admin/users/${user.id}`, {
                method: "PATCH",
                body: JSON.stringify({ isActive: !user.isActive }),
            });
            showNotification(
                "success",
                `User ${!user.isActive ? "activated" : "deactivated"} successfully`
            );
            fetchData();
        } catch (error) {
            console.error(error);
            showNotification("error", "Failed to update user status");
        }
    };

    const showNotification = (type: "success" | "error", message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    const clearFilters = () => {
        setSearchQuery("");
        setRoleFilter("ALL");
        setDivisionFilter("ALL");
        setStatusFilter("ALL");
    };

    const hasActiveFilters =
        searchQuery || roleFilter !== "ALL" || divisionFilter !== "ALL" || statusFilter !== "ALL";

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}

            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500 mt-1">Manage system users and staff accounts</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create User
                    </button>
                    <Link
                        href="/admin"
                        className="px-4 py-3 text-sm border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>

            <div className="card-animated">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                        >
                            Clear All Filters
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Search
                        </label>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Name or email..."
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Role
                        </label>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as any)}
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        >
                            <option value="ALL">All Roles</option>
                            <option value="ADMIN">Admin</option>
                            <option value="STAFF">Staff</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Division
                        </label>
                        <select
                            value={divisionFilter}
                            onChange={(e) => setDivisionFilter(e.target.value)}
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
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
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        >
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="card-animated text-center py-12">
                    <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-gray-500 mt-4">Loading users...</div>
                </div>
            ) : (
                <div className="card-animated">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Users List
                        </h2>
                        <span className="text-sm text-gray-500">
                            Showing {filteredUsers.length} of {users.length} users
                        </span>
                    </div>

                    {filteredUsers.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🔍</div>
                            <div className="text-gray-500">No users found</div>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">
                                            Name
                                        </th>
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">
                                            Email
                                        </th>
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">
                                            Role
                                        </th>
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">
                                            Division
                                        </th>
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">
                                            Status
                                        </th>
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">
                                            Created
                                        </th>
                                        <th className="text-right py-4 px-4 text-sm font-bold text-gray-700">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <UserRow
                                            key={user.id}
                                            user={user}
                                            onToggleStatus={() => toggleUserStatus(user)}
                                            onResetPassword={() => setResetPasswordUser(user)}
                                            onChangeDivision={() => setChangeDivisionUser(user)}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {createModalOpen && (
                <CreateUserModal
                    divisions={divisions}
                    onClose={() => setCreateModalOpen(false)}
                    onSuccess={() => {
                        setCreateModalOpen(false);
                        showNotification("success", "User created successfully");
                        fetchData();
                    }}
                    onError={(msg) => showNotification("error", msg)}
                />
            )}

            {resetPasswordUser && (
                <ResetPasswordModal
                    user={resetPasswordUser}
                    onClose={() => setResetPasswordUser(null)}
                    onSuccess={() => {
                        setResetPasswordUser(null);
                        showNotification("success", "Password reset successfully");
                    }}
                    onError={(msg) => showNotification("error", msg)}
                />
            )}

            {changeDivisionUser && (
                <ChangeDivisionModal
                    user={changeDivisionUser}
                    divisions={divisions}
                    onClose={() => setChangeDivisionUser(null)}
                    onSuccess={() => {
                        setChangeDivisionUser(null);
                        showNotification("success", "Division changed successfully");
                        fetchData();
                    }}
                    onError={(msg) => showNotification("error", msg)}
                />
            )}
        </div>
    );
}

function UserRow({
    user,
    onToggleStatus,
    onResetPassword,
    onChangeDivision,
}: {
    user: User;
    onToggleStatus: () => void;
    onResetPassword: () => void;
    onChangeDivision: () => void;
}) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <tr className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all group">
            <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="font-semibold text-gray-900">{user.name}</div>
                </div>
            </td>
            <td className="py-4 px-4 text-gray-600">{user.email}</td>
            <td className="py-4 px-4">
                <span
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold ${
                        user.role === "ADMIN"
                            ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md"
                            : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
                    }`}
                >
                    {user.role === "ADMIN" ? "👑" : "👤"} {user.role}
                </span>
            </td>
            <td className="py-4 px-4 text-gray-600">
                {user.division ? (
                    <Link
                        href={`/admin/divisions/${user.division.id}`}
                        className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                    >
                        {user.division.name}
                    </Link>
                ) : (
                    <span className="text-gray-400 italic">No division</span>
                )}
            </td>
            <td className="py-4 px-4">
                <span
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold ${
                        user.isActive
                            ? "bg-green-100 text-green-700 border-2 border-green-200"
                            : "bg-gray-100 text-gray-600 border-2 border-gray-200"
                    }`}
                >
                    <span className={`w-2 h-2 rounded-full ${user.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                    {user.isActive ? "Active" : "Inactive"}
                </span>
            </td>
            <td className="py-4 px-4 text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                })}
            </td>
            <td className="py-4 px-4 text-right">
                <div className="relative inline-block">
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className={`p-2.5 rounded-xl transition-all duration-200 ${
                            menuOpen
                                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                                : "bg-gray-100 hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 hover:text-white text-gray-600"
                        }`}
                        title="User actions"
                    >
                        <svg
                            className={`w-5 h-5 transition-transform duration-200 ${menuOpen ? "rotate-90" : ""}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                    </button>

                    {menuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setMenuOpen(false)}
                            />
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 z-20 overflow-hidden backdrop-blur-sm animate-fade-in-up">
                                <div className="p-2">
                                    <div className="px-3 py-2 border-b border-gray-100">
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">User Actions</div>
                                    </div>

                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                setMenuOpen(false);
                                                onResetPassword();
                                            }}
                                            className="w-full px-3 py-2.5 text-left rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-200 group/item flex items-center gap-3"
                                        >
                                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 group-hover/item:from-orange-500 group-hover/item:to-red-500 flex items-center justify-center transition-all duration-200">
                                                <svg className="w-5 h-5 text-orange-600 group-hover/item:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-semibold text-gray-900 group-hover/item:text-orange-700">Reset Password</div>
                                                <div className="text-xs text-gray-500 group-hover/item:text-orange-600">Set new credentials</div>
                                            </div>
                                            <svg className="w-4 h-4 text-gray-400 group-hover/item:text-orange-600 transition-all group-hover/item:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setMenuOpen(false);
                                                onChangeDivision();
                                            }}
                                            className="w-full px-3 py-2.5 text-left rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-200 group/item flex items-center gap-3"
                                        >
                                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 group-hover/item:from-blue-500 group-hover/item:to-cyan-500 flex items-center justify-center transition-all duration-200">
                                                <svg className="w-5 h-5 text-blue-600 group-hover/item:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-semibold text-gray-900 group-hover/item:text-blue-700">Change Division</div>
                                                <div className="text-xs text-gray-500 group-hover/item:text-blue-600">Reassign department</div>
                                            </div>
                                            <svg className="w-4 h-4 text-gray-400 group-hover/item:text-blue-600 transition-all group-hover/item:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="border-t border-gray-100 my-1"></div>

                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                setMenuOpen(false);
                                                onToggleStatus();
                                            }}
                                            className={`w-full px-3 py-2.5 text-left rounded-xl transition-all duration-200 group/item flex items-center gap-3 ${
                                                user.isActive
                                                    ? "hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50"
                                                    : "hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50"
                                            }`}
                                        >
                                            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center transition-all duration-200 ${
                                                user.isActive
                                                    ? "from-red-100 to-rose-100 group-hover/item:from-red-500 group-hover/item:to-rose-500"
                                                    : "from-green-100 to-emerald-100 group-hover/item:from-green-500 group-hover/item:to-emerald-500"
                                            }`}>
                                                {user.isActive ? (
                                                    <svg className="w-5 h-5 text-red-600 group-hover/item:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5 text-green-600 group-hover/item:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className={`text-sm font-semibold ${
                                                    user.isActive
                                                        ? "text-gray-900 group-hover/item:text-red-700"
                                                        : "text-gray-900 group-hover/item:text-green-700"
                                                }`}>
                                                    {user.isActive ? "Deactivate User" : "Activate User"}
                                                </div>
                                                <div className={`text-xs ${
                                                    user.isActive
                                                        ? "text-gray-500 group-hover/item:text-red-600"
                                                        : "text-gray-500 group-hover/item:text-green-600"
                                                }`}>
                                                    {user.isActive ? "Revoke access" : "Grant access"}
                                                </div>
                                            </div>
                                            <svg className={`w-4 h-4 text-gray-400 transition-all group-hover/item:translate-x-1 ${
                                                user.isActive
                                                    ? "group-hover/item:text-red-600"
                                                    : "group-hover/item:text-green-600"
                                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </td>
        </tr>
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
