import prisma from "../config/prisma";
import { hashPassword } from "../utils/password.util";

async function main() {
  const password_hash = await hashPassword("123456");

  await prisma.admin.create({
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
  .finally(() => prisma.$disconnect());