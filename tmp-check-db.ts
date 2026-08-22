// Verificación temporal: estado de la tabla Exercise tras los toggles del usuario.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const rows = await prisma.exercise.findMany({
    select: {
      catalogId: true,
      name: true,
      category: true,
      bodyPart: true,
      equipment: true,
      muscleGroup: true,
      target: true,
      secondaryMuscles: true,
      instructionSteps: true,
      image: true,
      gifUrl: true,
      attribution: true,
    },
    orderBy: { catalogId: "asc" },
  });
  console.log(JSON.stringify(rows, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
