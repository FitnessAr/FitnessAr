"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/features/admin/require-admin";
import { fetchCatalog, isCatalogConfigured } from "./catalog-api";

export type ToggleExerciseResult = { ok: true } | { ok: false; error: string };

// Detalle que devuelve la API con lang=es (instructions/instructionSteps recortados a español).
type ApiExerciseDetail = {
  id: string;
  name: string;
  category: string | null;
  bodyPart: string | null;
  equipment: string | null;
  muscleGroup: string | null;
  target: string | null;
  secondaryMuscles: unknown;
  instructionSteps: unknown;
  image: string | null;
  gifUrl: string | null;
  attribution: string | null;
};

function clampText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text ? text.slice(0, max) : null;
}

// Solo aceptamos lo que Prisma puede guardar como Json. Para "sin datos" usa DbNull
// (NULL de SQL), porque las columnas Json nullable esperan NullableJsonNullValueInput,
// no null pelado.
function toJson(
  value: unknown
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput {
  if (value === null || value === undefined || typeof value !== "object") {
    return Prisma.DbNull;
  }
  return value as Prisma.InputJsonValue;
}

function toSnapshot(branchId: string, detail: ApiExerciseDetail) {
  // Los paths de media se guardan relativos al deploy del catálogo (misma convención de la API
  // externa): sobrevive a un cambio de dominio/base URL y el cliente los resuelve al mostrar.
  const relative = (url: string | null) => url?.replace(/^\/+/, "") ?? null;

  return {
    branchId,
    catalogId: detail.id,
    name: clampText(detail.name, 255)!,
    category: clampText(detail.category, 100),
    bodyPart: clampText(detail.bodyPart, 100),
    equipment: clampText(detail.equipment, 100),
    muscleGroup: clampText(detail.muscleGroup, 100),
    target: clampText(detail.target, 100),
    secondaryMuscles: toJson(detail.secondaryMuscles),
    instructionSteps: toJson(detail.instructionSteps),
    image: relative(clampText(detail.image, 500)),
    gifUrl: relative(clampText(detail.gifUrl, 500)),
    attribution: clampText(detail.attribution, 500),
  };
}

// Interruptor de cada card del catálogo: incluir = crear la fila Exercise local; quitar =
// borrarla. El snapshot completo no viaja por el cliente — al incluir se pide el detalle fresco
// a la API (/api/exercises/:id?lang=es), así la fila local queda fiel a la fuente.
//
// La fila local es la que usan las rutinas (RoutineExercise.exercise, onDelete: Restrict) y el
// historial (SessionExercise): un ejercicio en uso NO se puede quitar — se bloquea con mensaje
// en vez de dejar romper rutinas activas.
export async function toggleExerciseAction(
  include: boolean,
  catalogId: string
): Promise<ToggleExerciseResult> {
  const admin = await requireAdmin();

  // Hoy los ids son numéricos de 4 dígitos ("0001"), pero el schema reserva hasta 10 caracteres.
  const id = String(catalogId ?? "").trim();
  if (!/^[A-Za-z0-9_-]{1,10}$/.test(id)) {
    return { ok: false, error: "Id de ejercicio inválido." };
  }
  if (!isCatalogConfigured()) {
    return {
      ok: false,
      error:
        "El catálogo global no está configurado (CATALOG_API_URL / CATALOG_API_KEY).",
    };
  }

  const existing = await prisma.exercise.findUnique({
    where: {
      branchId_catalogId: { branchId: admin.branchId, catalogId: id },
    },
    select: {
      id: true,
      name: true,
      _count: { select: { routineExercises: true, sessionExercises: true } },
    },
  });

  if (include && existing) {
    return { ok: true }; // ya está incluido: nada que hacer
  }

  if (!include) {
    if (!existing) {
      return { ok: true }; // ya no está incluido: nada que hacer
    }

    const usage =
      existing._count.routineExercises + existing._count.sessionExercises;
    if (usage > 0) {
      return {
        ok: false,
        error:
          `«${existing.name}» está siendo usado en ${existing._count.routineExercises} rutina(s) ` +
          `y ${existing._count.sessionExercises} entrenamiento(s) registrado(s). Primero quitálo ` +
          `de ahí si querés sacarlo del catálogo.`,
      };
    }

    await prisma.exercise.delete({ where: { id: existing.id } });
  } else {
    const response = await fetchCatalog<{ data: ApiExerciseDetail }>(
      `/api/exercises/${id}`,
      { lang: "es" }
    );
    const detail = response.data;
    if (!detail?.id || !detail.name) {
      return { ok: false, error: "El catálogo no devolvió el detalle del ejercicio." };
    }

    const snapshot = toSnapshot(admin.branchId, detail);
    await prisma.exercise.upsert({
      where: {
        branchId_catalogId: { branchId: admin.branchId, catalogId: id },
      },
      create: snapshot,
      update: snapshot,
    });
  }

  revalidatePath("/admin/ejercicios");
  return { ok: true };
}
