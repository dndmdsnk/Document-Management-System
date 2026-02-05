import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";
import Tesseract from "tesseract.js";

export const runtime = "nodejs";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    let auth;
    try { auth = requireAuth(req); } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await ctx.params;
    const doc = await prisma.document.findUnique({
        where: { id: params.id },
        include: { files: { take: 1, orderBy: { createdAt: "desc" } } },
    });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // NOTE: For real OCR you should OCR the actual file bytes.
    // Here we accept image URL/text input later. Keeping endpoint placeholder.
    const sampleText = "OCR placeholder. Integrate by downloading file from S3 then Tesseract.recognize(buffer)";
    await prisma.document.update({ where: { id: doc.id }, data: { ocrText: sampleText } });

    return NextResponse.json({ ok: true });
}
