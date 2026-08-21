import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { Role } from "../generated/prisma/enums";

// Seed de arranque de una instancia nueva — la base queda vacía salvo por la cuenta de
// administrador de bootstrap (ver CLAUDE.md: "alta de la primera cuenta de administrador de esa
// instancia"). Los datos de la demo comercial (Valentina Ruiz, Fuerza Total, etc.) NO se migran
// acá — siguen viviendo solo en features/*, que es lo que alimenta la demo mientras tanto.
//
// La cuenta de bootstrap (nombre "admin", DNI "12345678", contraseña "admin") es a propósito
// pública y hardcodeada (decidido con el usuario): es la puerta de entrada tanto para mostrar la
// demo como para el onboarding real de un cliente nuevo. El flujo de venta es: el cliente entra
// con esa cuenta, crea su propia cuenta admin (nombre y contraseña reales) y la elimina —
// cualquier admin puede eliminar cualquier cuenta, incluida otra de administrador (ver "Roles del
// sistema" en CLAUDE.md). No hay ningún mecanismo que fuerce ese borrado automáticamente: es
// intencional, para no dejar al cliente sin ninguna cuenta admin si pierde la contraseña de la
// que creó — la seguridad de esto depende de que el vendedor insista en el paso de borrado, no
// del código. DNI "12345678" reemplazó al loginId original "admin" cuando el login pasó a ser por
// DNI en vez de usuario libre (ver CLAUDE.md, "Roles del sistema") — no es el documento real de
// nadie, es un valor fijo elegido a propósito.
const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  let branch = await prisma.branch.findFirst();
  if (!branch) {
    branch = await prisma.branch.create({ data: { name: "Sucursal Demo" } });
  }

  const passwordHash = await bcrypt.hash("admin", 10);

  const admin = await prisma.user.upsert({
    where: { branchId_loginId: { branchId: branch.id, loginId: "12345678" } },
    update: { passwordHash, role: Role.ADMIN, name: "admin" },
    create: {
      branchId: branch.id,
      role: Role.ADMIN,
      loginId: "12345678",
      passwordHash,
      name: "admin",
    },
  });

  console.log("Seed OK:");
  console.log(`  Branch: ${branch.name} (${branch.id})`);
  console.log(`  User admin: ${admin.name} (${admin.id}), loginId="${admin.loginId}"`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
