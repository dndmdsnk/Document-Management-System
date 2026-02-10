import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/requireAuth";
import { logAudit } from "@/lib/logAudit";

const DEFAULT_SETTINGS = {
    statusWorkflow: [
        "RECEIVED",
        "UNDER REVIEW",
        "PENDING APPROVAL",
        "APPROVED",
        "REJECTED",
        "FORWARDED",
        "COMPLETED",
        "ARCHIVED",
    ],
    fileUploadMaxSize: 10,
    allowedFileTypes: [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"],
    retentionPeriodDays: 365,
    notificationsEnabled: true,
    emailNotifications: false,
    systemMaintenance: false,
};

let settings = { ...DEFAULT_SETTINGS };

export async function GET(req: NextRequest) {
    try {
        requireRole(req, "ADMIN" as any);
    } catch {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
    let admin;
    try {
        admin = requireRole(req, "ADMIN" as any);
    } catch {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const updatedSettings = { ...settings, ...body };
    settings = updatedSettings;

    await logAudit({
        action: "UPDATE_SETTINGS",
        entity: "SETTINGS",
        entityId: null,
        userId: admin.userId,
        meta: { changed: Object.keys(body) },
    });

    return NextResponse.json(settings);
}
