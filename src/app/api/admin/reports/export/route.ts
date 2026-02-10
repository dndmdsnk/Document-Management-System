import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/requireAuth";
import { logAudit } from "@/lib/logAudit";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    let admin;
    try {
        admin = requireRole(req, "ADMIN" as any);
    } catch {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { format, reportType, filters, data } = body;

    if (!format || !reportType || !data) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    await logAudit({
        action: "EXPORT_REPORT",
        entity: "REPORT",
        entityId: null,
        userId: admin.userId,
        meta: { format, reportType, filters },
    });

    if (format === "EXCEL") {
        const buffer = await generateExcel(reportType, data, filters);
        return new NextResponse(new Uint8Array(buffer), {
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="report_${reportType}_${Date.now()}.xlsx"`,
            },
        });
    } else if (format === "PDF") {
        const buffer = await generatePDF(reportType, data, filters);
        return new NextResponse(new Uint8Array(buffer), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="report_${reportType}_${Date.now()}.pdf"`,
            },
        });
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
}

async function generateExcel(reportType: string, data: any[], filters: any): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Report");

    worksheet.addRow(["Document Management System - Report"]);
    worksheet.addRow([`Report Type: ${reportType.replace(/_/g, " ")}`]);
    worksheet.addRow([`Generated: ${new Date().toLocaleString()}`]);
    worksheet.addRow([]);

    if (filters) {
        worksheet.addRow(["Filters:"]);
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== "ALL") {
                worksheet.addRow([`${key}: ${value}`]);
            }
        });
        worksheet.addRow([]);
    }

    if (data.length > 0) {
        const headers = Object.keys(data[0]).map(key =>
            key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())
        );
        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
        headerRow.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF0066CC" },
        };

        data.forEach(row => {
            worksheet.addRow(Object.values(row));
        });

        worksheet.columns.forEach(column => {
            if (!column) return;
            let maxLength = 0;
            column.eachCell?.({ includeEmpty: true }, cell => {
                const length = cell.value ? cell.value.toString().length : 10;
                if (length > maxLength) maxLength = length;
            });
            column.width = Math.min(maxLength + 2, 50);
        });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
}

async function generatePDF(reportType: string, data: any[], filters: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        const doc = new PDFDocument({ margin: 50, size: "A4" });

        doc.on("data", chunk => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        doc.fontSize(20).fillColor("#0066CC").text("Document Management System", { align: "center" });
        doc.moveDown(0.5);
        doc.fontSize(16).fillColor("#333333").text(`Report: ${reportType.replace(/_/g, " ")}`, { align: "center" });
        doc.moveDown(0.3);
        doc.fontSize(10).fillColor("#666666").text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });
        doc.moveDown(1);

        if (filters) {
            doc.fontSize(12).fillColor("#0066CC").text("Filters Applied:", { underline: true });
            doc.moveDown(0.3);
            doc.fontSize(10).fillColor("#333333");
            Object.entries(filters).forEach(([key, value]) => {
                if (value && value !== "ALL") {
                    doc.text(`${key.replace(/_/g, " ")}: ${value}`);
                }
            });
            doc.moveDown(1);
        }

        if (data.length > 0) {
            doc.fontSize(12).fillColor("#0066CC").text("Report Data:", { underline: true });
            doc.moveDown(0.5);

            const headers = Object.keys(data[0]).map(key =>
                key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())
            );

            const tableTop = doc.y;
            const columnWidth = 500 / headers.length;
            let yPosition = tableTop;

            doc.fontSize(9).fillColor("#FFFFFF");
            doc.rect(50, yPosition, 500, 20).fill("#0066CC");
            headers.forEach((header, i) => {
                doc.text(header, 55 + i * columnWidth, yPosition + 5, {
                    width: columnWidth - 10,
                    align: "left",
                });
            });

            yPosition += 20;
            doc.fillColor("#333333");

            data.forEach((row, rowIndex) => {
                if (yPosition > 700) {
                    doc.addPage();
                    yPosition = 50;
                }

                if (rowIndex % 2 === 0) {
                    doc.rect(50, yPosition, 500, 18).fill("#F0F0F0");
                }

                Object.values(row).forEach((value, i) => {
                    doc.fillColor("#333333").text(
                        String(value),
                        55 + i * columnWidth,
                        yPosition + 4,
                        { width: columnWidth - 10, align: "left" }
                    );
                });

                yPosition += 18;
            });
        } else {
            doc.fontSize(10).fillColor("#666666").text("No data available for this report.", { align: "center" });
        }

        doc.moveDown(2);
        doc.fontSize(8).fillColor("#999999").text(
            "This is a system-generated report. For questions, contact your system administrator.",
            { align: "center" }
        );

        doc.end();
    });
}
