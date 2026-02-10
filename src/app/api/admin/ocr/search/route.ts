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
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
        return NextResponse.json({ documents: [] });
    }

    const documents = await prisma.document.findMany({
        where: {
            ocrText: {
                contains: query,
                mode: "insensitive",
            },
        },
        include: {
            division: true,
            _count: {
                select: { files: true },
            },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
    });

    const docsWithStatus = documents.map(doc => ({
        ...doc,
        ocrStatus: doc.ocrText ? "COMPLETED" : "PENDING" as any,
    }));

    return NextResponse.json({ documents: docsWithStatus });
}
