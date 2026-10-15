import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Instancia única de Prisma Client para la app (a diferencia de prisma/seed.ts, que usa
// DIRECT_URL — acá se usa la conexión pooled, pensada para el volumen de queries de una app en
// ejecución). Cacheada en globalThis para no crear una instancia nueva (y agotar el pool de
// conexiones) en cada hot-reload de `next dev`.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    // Sin esto, el pool de `pg` usa su default (idleTimeoutMillis ~10s): en dev, con más de ~10s
    // entre clics, cada navegación reabre una conexión TCP+TLS nueva contra el pooler de Supabase
    // (en nuestro caso, ~200ms de RTT solo de ida y vuelta) antes de poder correr la primera query.
    // Subir la ventana de inactividad deja la conexión viva entre requests típicos de una sesión.
    max: 5,
    idleTimeoutMillis: 5 * 60 * 1000,
    keepAlive: true,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
