import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logAudit } from "@/lib/logAudit";

const Patch = z.object({
    divisionId: z.string().optional(),
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

    const data: any = {};
    if (body.divisionId) data.divisionId = body.divisionId;

    const doc = await prisma.document.update({
        where: { id: params.id },
        data,
    });

    await logAudit({
        action: "UPDATE_DOCUMENT",
        entity: "DOCUMENT",
        entityId: doc.id,
        userId: admin.userId,
        meta: { changed: Object.keys(data) },
    });

    return NextResponse.json({ ok: true });
}
