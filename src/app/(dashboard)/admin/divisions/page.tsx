"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

type Division = {
    id: string;
    name: string;
    createdAt: string;
    _count: {
        users: number;
        documents: number;
    };
};

export default function DivisionsPage() {
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchDivisions();
    }, []);

    const fetchDivisions = (searchQuery = "") => {
        setLoading(true);
        const url = searchQuery
            ? `/api/admin/divisions?search=${encodeURIComponent(searchQuery)}`
            : "/api/admin/divisions";

        apiFetch<{ divisions: Division[] }>(url)
            .then((data) => setDivisions(data.divisions))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchDivisions(search);
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Division Management</h1>
                    <p className="text-gray-500 mt-1">Manage all organizational divisions</p>
                </div>
                <Link
                    href="/admin"
                    className="px-4 py-2 text-sm border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all"
                >
                    ← Back to Dashboard
                </Link>
            </div>

            <form onSubmit={handleSearch} className="card-animated">
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search divisions by name..."
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    />
                    <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                    >
                        Search
                    </button>
                    {search && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch("");
                                fetchDivisions("");
                            }}
                            className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:border-red-500 hover:text-red-600 transition-all font-semibold"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </form>

            {loading ? (
                <div className="card-animated text-center py-12">
                    <div className="text-gray-500">Loading divisions...</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {divisions.map((division) => (
                        <DivisionCard key={division.id} division={division} />
                    ))}
                </div>
            )}

            {!loading && divisions.length === 0 && (
                <div className="card-animated text-center py-12">
                    <div className="text-gray-500">No divisions found</div>
                </div>
            )}
        </div>
    );
}

function DivisionCard({ division }: { division: Division }) {
    return (
        <Link href={`/admin/divisions/${division.id}`}>
            <div className="card-animated group cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl shadow-lg">
                        🏢
                    </div>
                    <div className="text-xs text-gray-500">
                        {new Date(division.createdAt).toLocaleDateString()}
                    </div>
                </div>

                <h3 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {division.name}
                </h3>

                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500">📄</span>
                        <span className="font-semibold text-gray-700">{division._count.documents}</span>
                        <span className="text-gray-500">docs</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500">👥</span>
                        <span className="font-semibold text-gray-700">{division._count.users}</span>
                        <span className="text-gray-500">staff</span>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                    View Details →
                </div>
            </div>
        </Link>
    );
}
