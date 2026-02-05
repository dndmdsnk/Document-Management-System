import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    let auth;
    try {
        auth = requireAuth(req);
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q")?.trim();
    const status = searchParams.get("status")?.trim();
    const divisionId = searchParams.get("divisionId")?.trim();
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: any = {};

    // role restriction
    if (auth.role !== "ADMIN") where.divisionId = auth.divisionId;

    if (divisionId && auth.role === "ADMIN") where.divisionId = divisionId;

    if (q) {
        where.OR = [
            { letterNo: { contains: q, mode: "insensitive" } },
            { subject: { contains: q, mode: "insensitive" } },
            { fromName: { contains: q, mode: "insensitive" } },
            { toName: { contains: q, mode: "insensitive" } },
            { ocrText: { contains: q, mode: "insensitive" } },
        ];
    }

    if (status) where.currentStatus = { name: status };

    if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt.gte = new Date(from);
        if (to) where.createdAt.lte = new Date(to);
    }

    const docs = await prisma.document.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
            division: true,
            currentStatus: true,
            files: { take: 1, orderBy: { createdAt: "desc" } },
        },
        take: 100,
    });

    return NextResponse.json({ docs });
}
