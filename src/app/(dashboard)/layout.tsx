"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/token";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<"ADMIN" | "STAFF" | null>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserRole(payload.role);
      setUserName(payload.name);

      const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin";

      if (payload.role === "STAFF" && isAdminRoute) {
        router.push("/forbidden");
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error("Token verification failed:", error);
      localStorage.removeItem("token");
      router.push("/login");
    }
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const adminNavItems = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/documents", label: "Documents", icon: "📄" },
    { href: "/admin/assignments", label: "Assignments", icon: "✓" },
    { href: "/admin/divisions", label: "Divisions", icon: "🏢" },
    { href: "/admin/users", label: "Users", icon: "👥" },
    { href: "/admin/reports", label: "Reports", icon: "📈" },
    { href: "/admin/ocr", label: "OCR", icon: "🔍" },
    { href: "/admin/audit-logs", label: "Audit Logs", icon: "📋" },
    { href: "/admin/settings", label: "Settings", icon: "⚙️" },
  ];

  const staffNavItems = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
  ];

  const navItems = userRole === "ADMIN" ? adminNavItems : staffNavItems;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm backdrop-blur-sm bg-white/95">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform">
                  📄
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  DMS {userRole === "ADMIN" ? "Admin" : "Portal"}
                </span>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      pathname === item.href
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-900">{userName}</div>
                  <div className={`text-xs font-bold ${
                    userRole === "ADMIN" ? "text-red-600" : "text-blue-600"
                  }`}>
                    {userRole}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  router.push("/login");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 border-2 border-gray-300 rounded-xl hover:border-red-500 hover:text-red-600 hover:shadow-lg transition-all"
              >
                Logout
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                {mobileMenuOpen ? "✕" : "☰"}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <nav className="md:hidden py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    pathname === item.href
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
