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

    const filter = searchParams.get("filter")?.trim();
    const divisionId = searchParams.get("divisionId")?.trim();
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {};

    if (filter === "OVERDUE") {
        where.status = "OPEN";
        where.dueDate = { lt: new Date() };
    } else if (filter === "OPEN") {
        where.status = "OPEN";
    } else if (filter === "DONE") {
        where.status = "DONE";
    }

    if (divisionId && divisionId !== "ALL") {
        where.document = { divisionId };
    }

    const [assignments, total] = await Promise.all([
        prisma.assignment.findMany({
            where,
            orderBy: { dueDate: "asc" },
            include: {
                document: {
                    include: {
                        division: true,
                        currentStatus: true,
                    },
                },
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                assignedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            take: limit,
            skip: offset,
        }),
        prisma.assignment.count({ where }),
    ]);

    return NextResponse.json({ assignments, total });
}
