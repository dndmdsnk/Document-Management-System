import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcrypt";
import { logAudit } from "@/lib/logAudit";

const Create = z.object({
    email: z.string().email(),
    name: z.string().min(2),
    role: z.enum(["ADMIN", "STAFF"]).default("STAFF"),
    divisionId: z.string().nullable().optional(),
    password: z.string().min(6),
});

export async function GET(req: NextRequest) {
    let admin;
    try {
        admin = requireRole(req, "ADMIN" as any);
    } catch {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
        include: { division: true },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
    let admin;
    try {
        admin = requireRole(req, "ADMIN" as any);
    } catch {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = Create.parse(await req.json());
    const passwordHash = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
        data: {
            email: body.email,
            name: body.name,
            role: body.role as any,
            divisionId: body.divisionId ?? null,
            passwordHash,
        },
    });

    await logAudit({
        action: "CREATE_USER",
        entity: "USER",
        entityId: user.id,
        userId: admin.userId,
        meta: { email: user.email, role: user.role, divisionId: user.divisionId },
    });

    return NextResponse.json({ id: user.id });
}
