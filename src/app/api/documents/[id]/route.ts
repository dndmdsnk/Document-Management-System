import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    let auth;
    try {
        auth = requireAuth(req);
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await ctx.params;
    const doc = await prisma.document.findUnique({
        where: { id: params.id },
        include: {
            division: true,
            currentStatus: true,
            statuses: { orderBy: { createdAt: "asc" }, include: { createdBy: true } },
            files: { orderBy: { createdAt: "desc" } },
            assignments: { orderBy: { createdAt: "desc" }, include: { assignee: true, assignedBy: true } },
            createdBy: true,
        },
    });

    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (auth.role !== "ADMIN" && doc.divisionId !== auth.divisionId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ doc });
}
