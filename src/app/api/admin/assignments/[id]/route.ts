import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logAudit } from "@/lib/logAudit";

const Patch = z.object({
    status: z.enum(["OPEN", "DONE"]).optional(),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    let admin;
    try {
        admin = requireRole(req, "ADMIN" as any);
    } catch {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const params = await ctx.params;
    const body = Patch.parse(await req.json());

    const assignment = await prisma.assignment.update({
        where: { id: params.id },
        data: {
            status: body.status,
        },
        include: {
            document: true,
        },
    });

    await logAudit({
        action: "UPDATE_ASSIGNMENT",
        entity: "ASSIGNMENT",
        entityId: assignment.id,
        userId: admin.userId,
        meta: { status: body.status, documentId: assignment.documentId },
    });

    return NextResponse.json({ ok: true });
}
