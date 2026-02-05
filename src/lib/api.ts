import { getToken } from "./token";

export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = typeof window !== "undefined" ? getToken() : null;

    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Request failed");
    }
    return res.json();
}
