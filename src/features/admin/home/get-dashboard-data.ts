import { prisma } from "@/lib/db";

export type DashboardData = {
  clientes: number;
  profesores: number;
  ejercicios: number;
  rutinas: number;
};

export async function getDashboardData(branchId: string): Promise<DashboardData> {
  const [clientes, profesores, ejercicios, rutinas] = await Promise.all([
    prisma.user.count({ where: { branchId, role: "CLIENTE" } }),
    prisma.user.count({ where: { branchId, role: "PROFESOR" } }),
    prisma.exercise.count({ where: { branchId } }),
    prisma.routine.count({ where: { branchId } }),
  ]);

  return { clientes, profesores, ejercicios, rutinas };
}
