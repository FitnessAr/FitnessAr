// Script E2E temporal (se borra después): busca un admin real, firma su userId con
// SESSION_SECRET y devuelve la cookie lista para usar contra el dev server.
import "dotenv/config";
import { createHmac } from "crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true, loginId: true, name: true, branchId: true },
  });
  if (!admin) throw new Error("No hay ningún ADMIN en la base");

  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("Falta SESSION_SECRET");

  const signature = createHmac("sha256", secret).update(admin.id).digest("hex");
  const cookieValue = `real:${admin.id}.${signature}`;

  const exercises = await prisma.exercise.findMany({
    where: { branchId: admin.branchId },
    take: 5,
    select: { catalogId: true, name: true },
  });

  console.log(JSON.stringify({ admin, cookieValue, exercises }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
