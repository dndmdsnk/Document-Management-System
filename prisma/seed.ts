import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    // Divisions
    const divisions = [
        "Administration division",
        "National secretary for early childhood development",
        "Women's bureau of Sri Lanka",
        "National committee on women",
        "Planning and IT division",
        "National child protection Authority",
        "Development Division",
        "Department of probation & child care services",
        "Procurement",
        "Ministry office",
        "Deputy ministry office",
        "Secretary office",
    ];

    for (const name of divisions) {
        await prisma.division.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }

    // Admin user
    const passwordHash = await bcrypt.hash("Admin@123", 10);

    await prisma.user.upsert({
        where: { email: "admin@ministry.gov.lk" },
        update: {},
        create: {
            email: "admin@ministry.gov.lk",
            name: "System Admin",
            passwordHash,
            role: Role.ADMIN,
        },
    });

    console.log("✅ Seed completed");
    console.log("Admin login → admin@ministry.gov.lk / Admin@123");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
