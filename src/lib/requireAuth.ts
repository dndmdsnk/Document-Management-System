import { NextRequest } from "next/server";
import { verifyToken } from "./auth";
import { Role } from "@prisma/client";

export function getAuth(req: NextRequest) {
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) return null;
    const token = auth.slice("Bearer ".length);
    try {
        return verifyToken(token);
    } catch {
        return null;
    }
}

export function requireAuth(req: NextRequest) {
    const user = getAuth(req);
    if (!user) throw new Error("UNAUTHORIZED");
    return user;
}

export function requireRole(req: NextRequest, role: Role) {
    const user = requireAuth(req);
    if (user.role !== role) throw new Error("FORBIDDEN");
    return user;
}
