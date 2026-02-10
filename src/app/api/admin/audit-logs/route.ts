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

    const action = searchParams.get("action")?.trim();
    const entity = searchParams.get("entity")?.trim();
    const userId = searchParams.get("userId")?.trim();
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {};

    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (userId) where.userId = userId;

    if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt.gte = new Date(from);
        if (to) where.createdAt.lte = new Date(to);
    }

    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
            take: limit,
            skip: offset,
        }),
        prisma.auditLog.count({ where }),
    ]);

    const uniqueActions = await prisma.auditLog.findMany({
        where: {},
        select: { action: true },
        distinct: ["action"],
        orderBy: { action: "asc" },
    });

    const uniqueEntities = await prisma.auditLog.findMany({
        where: {},
        select: { entity: true },
        distinct: ["entity"],
        orderBy: { entity: "asc" },
    });

    return NextResponse.json({
        logs,
        total,
        uniqueActions: uniqueActions.map(a => a.action),
        uniqueEntities: uniqueEntities.map(e => e.entity),
    });
}
