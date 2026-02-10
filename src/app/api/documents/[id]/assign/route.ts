import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logAudit } from "@/lib/logAudit";

const Body = z.object({
    assigneeId: z.string(),
    dueDate: z.string().optional(),
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

    const assignment = await prisma.assignment.create({
        data: {
            documentId: doc.id,
            assigneeId: body.assigneeId,
            assignedById: auth.userId,
            dueDate: body.dueDate ? new Date(body.dueDate) : null,
            note: body.note,
            status: "OPEN",
        },
    });

    await logAudit({
        action: "CREATE_ASSIGNMENT",
        entity: "ASSIGNMENT",
        entityId: assignment.id,
        userId: auth.userId,
        meta: { documentId: doc.id, assigneeId: body.assigneeId, dueDate: body.dueDate },
    });

    return NextResponse.json({ id: assignment.id });
}
