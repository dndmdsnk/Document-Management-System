import { prisma } from "./prisma";

export async function logAudit(args: {
    action: string;
    entity: string;
    entityId?: string | null;
    userId?: string | null;
    meta?: any;
}) {
    await prisma.auditLog.create({
        data: {
            action: args.action,
            entity: args.entity,
            entityId: args.entityId ?? null,
            userId: args.userId ?? null,
            meta: args.meta ?? undefined,
        },
    });
}
