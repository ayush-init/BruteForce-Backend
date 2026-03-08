"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../config/prisma"));
const password_util_1 = require("../utils/password.util");
async function main() {
    const password_hash = await (0, password_util_1.hashPassword)("123456");
    await prisma_1.default.admin.create({
        data: {
            name: "Dhruv",
            email: "superadmin@test.com",
            username: "superadmin",
            password_hash,
            role: "SUPERADMIN",
        },
    });
    console.log("SuperAdmin created");
}
main()
    .catch(console.error)
    .finally(() => prisma_1.default.$disconnect());
