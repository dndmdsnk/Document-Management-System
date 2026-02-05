import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";
import { s3, S3_BUCKET } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import { logAudit } from "@/lib/logAudit";

export const runtime = "nodejs"; // needed for s3 sdk

export async function POST(req: NextRequest) {
    let auth;
    try {
        auth = requireAuth(req);
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();

    const letterNo = String(form.get("letterNo") || "").trim();
    const toName = String(form.get("toName") || "").trim();
    const fromName = String(form.get("fromName") || "").trim();
    const subject = String(form.get("subject") || "").trim();
    const statusName = String(form.get("status") || "RECEIVED").trim();
    const divisionId = String(form.get("divisionId") || auth.divisionId || "").trim();

    const file = form.get("file") as File | null;
    if (!letterNo || !divisionId || !file) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const storageKey = `documents/${divisionId}/${Date.now()}-${nanoid()}-${file.name}`;

    await s3.send(
        new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: storageKey,
            Body: bytes,
            ContentType: file.type || "application/octet-stream",
        })
    );

    const doc = await prisma.document.create({
        data: {
            letterNo,
            toName,
            fromName,
            subject,
            divisionId,
            createdById: auth.userId,
            files: {
                create: {
                    originalName: file.name,
                    mimeType: file.type || "application/octet-stream",
                    sizeBytes: bytes.length,
                    storageKey,
                    uploadedById: auth.userId,
                },
            },
            statuses: {
                create: {
                    name: statusName,
                    createdById: auth.userId,
                    note: "Initial status",
                },
            },
        },
        include: { statuses: true },
    });

    // set current status = latest
    await prisma.document.update({
        where: { id: doc.id },
        data: { currentStatusId: doc.statuses[0].id },
    });

    await logAudit({
        action: "UPLOAD",
        entity: "DOCUMENT",
        entityId: doc.id,
        userId: auth.userId,
        meta: { letterNo, divisionId, fileName: file.name },
    });

    return NextResponse.json({ id: doc.id });
}
