import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/lib/password";
import "dotenv/config";

console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const email = "admin@healbynature.com";
  const password = "ChangeThisPassword123!";

  const passwordHash = await hashPassword(password);

  const admin = await prisma.user.upsert({
    where: {
      email,
    },
    update: {
      passwordHash,
      role: "ADMIN",
    },
    create: {
      email,
      name: "Admin User",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Admin created successfully:");
  console.log("Email:", admin.email);
  console.log("Role:", admin.role);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });