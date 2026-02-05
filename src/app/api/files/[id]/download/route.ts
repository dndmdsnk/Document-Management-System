import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";
import { s3, S3_BUCKET } from "@/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { logAudit } from "@/lib/logAudit";

export const runtime = "nodejs";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    let auth;
    try {
        auth = requireAuth(req);
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await ctx.params;
    const file = await prisma.fileObject.findUnique({
        where: { id: params.id },
        include: { document: true },
    });

    if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // STAFF can access only their division documents (ADMIN all)
    if (auth.role !== "ADMIN" && file.document.divisionId !== auth.divisionId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = await getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: S3_BUCKET, Key: file.storageKey }),
        { expiresIn: 60 }
    );

    await logAudit({
        action: "DOWNLOAD",
        entity: "FILE",
        entityId: file.id,
        userId: auth.userId,
        meta: { documentId: file.documentId, originalName: file.originalName },
    });

    return NextResponse.json({ url });
}
