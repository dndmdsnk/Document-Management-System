import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET missing");

export type JwtUser = {
    userId: string;
    role: Role;
    divisionId: string | null;
    email: string;
    name: string;
};

export function signToken(payload: JwtUser) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
}

export function verifyToken(token: string): JwtUser {
    return jwt.verify(token, JWT_SECRET) as JwtUser;
}
