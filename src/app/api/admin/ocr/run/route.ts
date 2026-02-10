import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/logAudit";
import { z } from "zod";

const Body = z.object({
    documentIds: z.array(z.string()),
});

export async function POST(req: NextRequest) {
    let admin;
    try {
        admin = requireRole(req, "ADMIN" as any);
    } catch {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = Body.parse(await req.json());

    for (const docId of body.documentIds) {
        const doc = await prisma.document.findUnique({
            where: { id: docId },
            include: { files: { take: 1, orderBy: { createdAt: "desc" } } },
        });

        if (!doc || doc.files.length === 0) continue;

        const sampleOCRText = `Document: ${doc.letterNo}
Subject: ${doc.subject || "N/A"}
From: ${doc.fromName || "N/A"}
To: ${doc.toName || "N/A"}

[OCR PLACEHOLDER TEXT]
This is a simulated OCR output for demonstration purposes.
In production, this would contain the actual extracted text from the document file.

To integrate real OCR:
1. Download the file from S3 using the storageKey
2. Use Tesseract.js to extract text from images
3. For PDFs, use pdf-parse or similar libraries
4. Store the extracted text in the ocrText field

Sample content for search testing:
Ministry document regarding ${doc.subject || "administrative matters"}
Reference number: ${doc.letterNo}
Date: ${doc.createdAt.toLocaleDateString()}`;

        await prisma.document.update({
            where: { id: docId },
            data: { ocrText: sampleOCRText },
        });

        await logAudit({
            action: "OCR_RUN",
            entity: "DOCUMENT",
            entityId: docId,
            userId: admin.userId,
            meta: { letterNo: doc.letterNo },
        });
    }

    return NextResponse.json({
        success: true,
        processed: body.documentIds.length,
    });
}
