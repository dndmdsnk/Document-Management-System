import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcrypt";
import { logAudit } from "@/lib/logAudit";

const Patch = z.object({
    resetPassword: z.string().min(6).optional(),
    divisionId: z.string().nullable().optional(),
    isActive: z.boolean().optional(),
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
    if (body.resetPassword) data.passwordHash = await bcrypt.hash(body.resetPassword, 10);
    if ("divisionId" in body) data.divisionId = body.divisionId ?? null;
    if ("isActive" in body) data.isActive = body.isActive;

    const user = await prisma.user.update({
        where: { id: params.id },
        data,
    });

    await logAudit({
        action: "UPDATE_USER",
        entity: "USER",
        entityId: user.id,
        userId: admin.userId,
        meta: { changed: Object.keys(data) },
    });

    return NextResponse.json({ ok: true });
}
