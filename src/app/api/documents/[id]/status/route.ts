import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logAudit } from "@/lib/logAudit";

const Body = z.object({
    name: z.string().min(2),
    note: z.string().optional(),
});

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    let auth;
    try {
        auth = requireAuth(req);
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await ctx.params;
    const body = Body.parse(await req.json());

    const doc = await prisma.document.findUnique({ where: { id: params.id } });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (auth.role !== "ADMIN" && doc.divisionId !== auth.divisionId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const st = await prisma.status.create({
        data: {
            documentId: doc.id,
            name: body.name,
            note: body.note,
            createdById: auth.userId,
        },
    });

    await prisma.document.update({
        where: { id: doc.id },
        data: { currentStatusId: st.id },
    });

    await logAudit({
        action: "STATUS_CHANGE",
        entity: "DOCUMENT",
        entityId: doc.id,
        userId: auth.userId,
        meta: { newStatus: body.name, note: body.note },
    });

    return NextResponse.json({ ok: true });
}
