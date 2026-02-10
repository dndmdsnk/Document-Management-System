"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForbiddenPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

            <div className="absolute top-20 left-20 w-96 h-96 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

            <div className="relative z-10 text-center px-6 animate-fade-in-up">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-3xl bg-gradient-to-br from-red-500 to-orange-500 shadow-2xl shadow-red-500/50 mb-8 animate-pulse-soft">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <h1 className="text-7xl font-bold text-transparent bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text mb-4">
                    403
                </h1>

                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    Access Forbidden
                </h2>

                <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
                    You don't have permission to access this resource. This area is restricted to administrators only.
                </p>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-red-200 p-6 max-w-lg mx-auto mb-8 shadow-xl">
                    <div className="flex items-start gap-4">
                        <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div className="text-left flex-1">
                            <h3 className="font-bold text-red-900 mb-2">Access Restricted</h3>
                            <p className="text-sm text-red-700">
                                This section requires administrator privileges. If you believe you should have access, please contact your system administrator.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-4 flex-wrap">
                    <button
                        onClick={() => router.back()}
                        className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all flex items-center gap-3 shadow-lg"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Go Back
                    </button>

                    <Link
                        href="/admin"
                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all flex items-center gap-3 shadow-lg"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Go to Dashboard
                    </Link>
                </div>

                <div className="mt-8 text-sm text-gray-500">
                    Error Code: 403 - Forbidden Access
                </div>
            </div>
        </div>
    );
}
