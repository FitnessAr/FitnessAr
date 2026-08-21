import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7: este archivo solo lo usa la CLI (migrate, db seed, studio) — el PrismaClient de la
// app en tiempo de ejecución NO lee este archivo, se configura aparte con un driver adapter.
// Se usa DIRECT_URL (conexión directa a Supabase, sin PgBouncer) para migraciones/seed, porque
// el pooler puede dar problemas con las sentencias DDL/transaccionales que corre Migrate.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
