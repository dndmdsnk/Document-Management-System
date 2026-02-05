import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { signToken } from "@/lib/auth";
import { z } from "zod";
import { logAudit } from "@/lib/logAudit";

const Body = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export async function POST(req: NextRequest) {
    const json = await req.json();
    const body = Body.parse(json);

    const user = await prisma.user.findUnique({
        where: { email: body.email },
        include: { division: true },
    });

    if (!user || !user.isActive) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signToken({
        userId: user.id,
        role: user.role,
        divisionId: user.divisionId,
        email: user.email,
        name: user.name,
    });

    await logAudit({
        action: "LOGIN",
        entity: "USER",
        entityId: user.id,
        userId: user.id,
        meta: { email: user.email },
    });

    return NextResponse.json({ token });
}
