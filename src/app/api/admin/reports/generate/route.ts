import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        requireRole(req, "ADMIN" as any);
    } catch {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get("reportType");
    const divisionId = searchParams.get("divisionId");
    const status = searchParams.get("status");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const timeRange = searchParams.get("timeRange") || "MONTHLY";

    let data: any[] = [];
    let summary: any = {};
    const filters: any = { reportType, divisionId, status, dateFrom, dateTo, timeRange };

    const now = new Date();
    let startDate = new Date();

    if (timeRange === "WEEKLY") {
        startDate.setDate(now.getDate() - 7);
    } else if (timeRange === "MONTHLY") {
        startDate.setMonth(now.getMonth() - 1);
    } else if (timeRange === "CUSTOM" && dateFrom) {
        startDate = new Date(dateFrom);
    }

    const endDate = dateTo ? new Date(dateTo) : now;

    if (reportType === "DOCUMENTS_BY_DIVISION") {
        const where: any = {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        };

        if (divisionId && divisionId !== "ALL") {
            where.divisionId = divisionId;
        }

        if (status && status !== "ALL") {
            where.currentStatus = { name: status };
        }

        const documents = await prisma.document.groupBy({
            by: ["divisionId"],
            where,
            _count: { id: true },
        });

        const divisions = await prisma.division.findMany({
            where: { id: { in: documents.map(d => d.divisionId) } },
        });

        const divMap = divisions.reduce((acc, d) => {
            acc[d.id] = d.name;
            return acc;
        }, {} as Record<string, string>);

        data = documents.map(d => ({
            division: divMap[d.divisionId] || "Unknown",
            document_count: d._count.id,
        }));

        summary = {
            total_documents: documents.reduce((sum, d) => sum + d._count.id, 0),
            divisions_count: documents.length,
        };
    } else if (reportType === "STATUS_SUMMARY") {
        const where: any = {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        };

        if (divisionId && divisionId !== "ALL") {
            where.document = { divisionId };
        }

        const statuses = await prisma.status.groupBy({
            by: ["name"],
            where,
            _count: { id: true },
        });

        data = statuses.map(s => ({
            status: s.name,
            count: s._count.id,
        }));

        summary = {
            total_status_changes: statuses.reduce((sum, s) => sum + s._count.id, 0),
            unique_statuses: statuses.length,
        };
    } else if (reportType === "OVERDUE_ASSIGNMENTS") {
        const where: any = {
            status: "OPEN",
            dueDate: { lt: now },
        };

        if (divisionId && divisionId !== "ALL") {
            where.document = { divisionId };
        }

        const assignments = await prisma.assignment.findMany({
            where,
            include: {
                document: {
                    include: { division: true },
                },
                assignee: {
                    select: { name: true, email: true },
                },
            },
            orderBy: { dueDate: "asc" },
        });

        data = assignments.map(a => ({
            letter_no: a.document.letterNo,
            division: a.document.division.name,
            assignee: a.assignee.name,
            due_date: a.dueDate?.toLocaleDateString() || "N/A",
            days_overdue: a.dueDate ? Math.ceil((now.getTime() - new Date(a.dueDate).getTime()) / (1000 * 60 * 60 * 24)) : 0,
        }));

        summary = {
            total_overdue: assignments.length,
            average_days_overdue: data.length > 0
                ? Math.round(data.reduce((sum, d) => sum + d.days_overdue, 0) / data.length)
                : 0,
        };
    } else if (reportType === "ACTIVITY_REPORT") {
        const where: any = {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        };

        const [uploads, downloads, logins] = await Promise.all([
            prisma.auditLog.count({
                where: { ...where, action: "UPLOAD" },
            }),
            prisma.auditLog.count({
                where: { ...where, action: "DOWNLOAD" },
            }),
            prisma.auditLog.count({
                where: { ...where, action: "LOGIN" },
            }),
        ]);

        const topUsers = await prisma.auditLog.groupBy({
            by: ["userId"],
            where,
            _count: { id: true },
            orderBy: { _count: { id: "desc" } },
            take: 10,
        });

        const userIds = topUsers.map(u => u.userId).filter((id): id is string => id !== null);
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
        });

        const userMap = users.reduce((acc, u) => {
            acc[u.id] = u.name;
            return acc;
        }, {} as Record<string, string>);

        data = topUsers.map(u => ({
            user: u.userId ? userMap[u.userId] || "Unknown" : "System",
            activity_count: u._count.id,
        }));

        summary = {
            total_uploads: uploads,
            total_downloads: downloads,
            total_logins: logins,
            total_activities: uploads + downloads + logins,
        };
    }

    return NextResponse.json({
        reportType,
        filters,
        data,
        summary,
    });
}
