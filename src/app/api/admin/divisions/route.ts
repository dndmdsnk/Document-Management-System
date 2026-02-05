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
    const search = searchParams.get("search")?.trim();

    const where = search ? {
        OR: [
            { name: { contains: search, mode: "insensitive" as any } },
        ],
    } : {};

    const divisions = await prisma.division.findMany({
        where,
        orderBy: { name: "asc" },
        include: {
            _count: {
                select: {
                    users: true,
                    documents: true,
                },
            },
        },
    });

    return NextResponse.json({ divisions });
}
