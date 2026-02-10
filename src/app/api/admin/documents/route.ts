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

    const divisionId = searchParams.get("divisionId")?.trim();
    const status = searchParams.get("status")?.trim();
    const letterNo = searchParams.get("letterNo")?.trim();
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {};

    if (divisionId && divisionId !== "ALL") {
        where.divisionId = divisionId;
    }

    if (letterNo) {
        where.letterNo = { contains: letterNo, mode: "insensitive" };
    }

    if (status && status !== "ALL") {
        where.currentStatus = { name: status };
    }

    if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt.gte = new Date(from);
        if (to) where.createdAt.lte = new Date(to);
    }

    const [documents, total] = await Promise.all([
        prisma.document.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
                division: true,
                currentStatus: true,
                createdBy: { select: { id: true, name: true, email: true } },
                _count: {
                    select: {
                        files: true,
                        assignments: true,
                    },
                },
            },
            take: limit,
            skip: offset,
        }),
        prisma.document.count({ where }),
    ]);

    return NextResponse.json({ documents, total });
}
