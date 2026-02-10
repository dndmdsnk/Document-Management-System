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
    const divisionId = searchParams.get("divisionId");
    const ocrStatus = searchParams.get("ocrStatus");

    const where: any = {};

    if (divisionId && divisionId !== "ALL") {
        where.divisionId = divisionId;
    }

    const documents = await prisma.document.findMany({
        where,
        include: {
            division: true,
            _count: {
                select: { files: true },
            },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
    });

    const docsWithStatus = documents.map(doc => {
        let status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" = "PENDING";

        if (doc.ocrText) {
            status = "COMPLETED";
        } else if (doc._count.files > 0) {
            status = "PENDING";
        }

        return {
            ...doc,
            ocrStatus: status,
        };
    });

    const filtered = ocrStatus && ocrStatus !== "ALL"
        ? docsWithStatus.filter(d => d.ocrStatus === ocrStatus)
        : docsWithStatus;

    return NextResponse.json({ documents: filtered });
}
