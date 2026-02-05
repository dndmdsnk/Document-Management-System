import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        requireRole(req, "ADMIN" as any);
    } catch {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const params = await ctx.params;
    const division = await prisma.division.findUnique({
        where: { id: params.id },
        include: {
            _count: {
                select: {
                    users: true,
                    documents: true,
                },
            },
            users: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                },
                orderBy: { name: "asc" },
            },
        },
    });

    if (!division) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const documentsByStatus = await prisma.document.groupBy({
        by: ["currentStatusId"],
        where: { divisionId: params.id },
        _count: { id: true },
    });

    const statusIds = documentsByStatus
        .map(d => d.currentStatusId)
        .filter((id): id is string => id !== null);

    const statuses = await prisma.status.findMany({
        where: { id: { in: statusIds } },
    });

    const statusMap = statuses.reduce((acc, s) => {
        acc[s.id] = s.name;
        return acc;
    }, {} as Record<string, string>);

    const statusCounts = documentsByStatus.reduce((acc, d) => {
        const statusName = d.currentStatusId ? statusMap[d.currentStatusId] || "Unknown" : "No Status";
        acc[statusName] = (acc[statusName] || 0) + d._count.id;
        return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
        division,
        statusCounts,
    });
}
