import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        requireRole(req, "ADMIN" as any);
    } catch {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [
        totalDocuments,
        documentsByStatus,
        overdueAssignments,
        documentsToday,
        documentsThisWeek,
        downloadsToday,
        downloadsThisWeek,
        activeUsers,
        documentsByDivision,
    ] = await Promise.all([
        prisma.document.count(),

        prisma.status.groupBy({
            by: ["name"],
            _count: { id: true },
            where: {
                id: {
                    in: (await prisma.document.findMany({
                        where: { currentStatusId: { not: null } },
                        select: { currentStatusId: true },
                    })).map(d => d.currentStatusId!),
                },
            },
        }),

        prisma.assignment.count({
            where: {
                status: "OPEN",
                dueDate: { lt: now },
            },
        }),

        prisma.document.count({
            where: { createdAt: { gte: startOfToday } },
        }),

        prisma.document.count({
            where: { createdAt: { gte: startOfWeek } },
        }),

        prisma.auditLog.count({
            where: {
                action: "DOWNLOAD",
                createdAt: { gte: startOfToday },
            },
        }),

        prisma.auditLog.count({
            where: {
                action: "DOWNLOAD",
                createdAt: { gte: startOfWeek },
            },
        }),

        prisma.user.count({
            where: { isActive: true },
        }),

        prisma.document.groupBy({
            by: ["divisionId"],
            _count: { id: true },
        }),
    ]);

    const statusCounts = documentsByStatus.reduce((acc, s) => {
        acc[s.name] = s._count.id;
        return acc;
    }, {} as Record<string, number>);

    const divisions = await prisma.division.findMany({
        where: {
            id: { in: documentsByDivision.map(d => d.divisionId) },
        },
    });

    const divisionMap = divisions.reduce((acc, d) => {
        acc[d.id] = d.name;
        return acc;
    }, {} as Record<string, string>);

    const docsByDivision = documentsByDivision.map(d => ({
        divisionId: d.divisionId,
        divisionName: divisionMap[d.divisionId] || "Unknown",
        count: d._count.id,
    }));

    return NextResponse.json({
        totalDocuments,
        statusCounts,
        overdueAssignments,
        documentsToday,
        documentsThisWeek,
        downloadsToday,
        downloadsThisWeek,
        activeUsers,
        documentsByDivision: docsByDivision,
    });
}
