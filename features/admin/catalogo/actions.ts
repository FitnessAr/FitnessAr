"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/features/admin/require-admin";
import { CATALOG_CACHE, fetchCatalog, isCatalogConfigured } from "./catalog-api";

export type ToggleItemResult = { ok: true } | { ok: false; error: string };
export type ToggleOp = { catalogId: string; include: boolean };

// Resultado de un lote: una entrada por operación, en cualquier orden (el cliente matchea por id).
export type ApplyTogglesResult = {
  results: Array<{ catalogId: string } & ToggleItemResult>;
};

export type ToggleExerciseResult = ToggleItemResult;

const ID_PATTERN = /^[A-Za-z0-9_-]{1,10}$/;
// Techo defensivo del lote: la cola del cliente flushea pocas operaciones, pero nunca aceptar
// un array gigante desde un cliente manipulado.
const MAX_OPS = 50;
// Detalles pedidos a la API en paralelo por chunk para no golpear el catálogo externo.
const DETAIL_CHUNK_SIZE = 8;

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

// Interruptor de las cards del catálogo, en LOTE: incluir = crear filas Exercise locales; quitar
// = borrarlas. Un solo round-trip para N toggles (la UI encola clicks y flushea acá): 1 auth,
// 1 query de estado/uso para todos los ids, detalles pedidos en paralelo por chunks y un único
// createMany/deleteMany + revalidatePath.
//
// La fila local es la que usan las rutinas (RoutineExercise.exercise, onDelete: Restrict) y el
// historial (SessionExercise): un ejercicio en uso NO se puede quitar — se bloquea con mensaje
// por ítem en vez de dejar romper rutinas activas.
export async function applyTogglesAction(ops: ToggleOp[]): Promise<ApplyTogglesResult> {
  const results: ApplyTogglesResult["results"] = [];

  if (!Array.isArray(ops) || ops.length === 0) {
    return { results };
  }

  const batch = ops.slice(0, MAX_OPS);

  const admin = await requireAdmin();

  if (!isCatalogConfigured()) {
    const error =
      "El catálogo global no está configurado (CATALOG_API_URL / CATALOG_API_KEY).";
    return {
      results: batch.map((op) => ({
        catalogId: String(op?.catalogId ?? ""),
        ok: false as const,
        error,
      })),
    };
  }

  // Dedupe por id (último valor gana): si el usuario toca dos veces la misma card antes del
  // flush, solo importa el estado final.
  const byId = new Map<string, boolean>();
  for (const op of batch) {
    const id = String(op?.catalogId ?? "").trim();
    byId.set(id, Boolean(op?.include));
  }

  // Hoy los ids son numéricos de 4 dígitos ("0001"), pero el schema reserva hasta 10 caracteres.
  const valid = new Map<string, boolean>();
  for (const [id, include] of byId) {
    if (ID_PATTERN.test(id)) {
      valid.set(id, include);
    } else {
      results.push({ catalogId: id, ok: false, error: "Id de ejercicio inválido." });
    }
  }
  if (valid.size === 0) return { results };

  // Estado + uso actual de todos los ids en UNA query.
  const existingRows = await prisma.exercise.findMany({
    where: { branchId: admin.branchId, catalogId: { in: [...valid.keys()] } },
    select: {
      id: true,
      catalogId: true,
      name: true,
      isCustom: true,
      _count: { select: { routineExercises: true, sessionExercises: true } },
    },
  });
  const existingByCatalogId = new Map(existingRows.map((row) => [row.catalogId, row]));

  let mutated = false;
  const deleteCatalogIds: string[] = [];
  const createIds: string[] = [];

  for (const [id, include] of valid) {
    const existing = existingByCatalogId.get(id);

    if (include) {
      if (existing) {
        results.push({ catalogId: id, ok: true }); // ya está incluido: nada que hacer
      } else {
        createIds.push(id);
      }
      continue;
    }

    // Defensiva: los ejercicios propios (isCustom) NO se tocan por acá — se administran con
    // update/deleteCustomExerciseAction. Un toggle-off sobre su id es un no-op.
    if (!existing || existing.isCustom) {
      results.push({ catalogId: id, ok: true }); // ya no está incluido: nada que hacer
      continue;
    }

    const usage = existing._count.routineExercises + existing._count.sessionExercises;
    if (usage > 0) {
      results.push({
        catalogId: id,
        ok: false,
        error:
          `«${existing.name}» está siendo usado en ${existing._count.routineExercises} rutina(s) ` +
          `y ${existing._count.sessionExercises} entrenamiento(s) registrado(s). Primero quitálo ` +
          `de ahí si querés sacarlo del catálogo.`,
      });
      continue;
    }
    deleteCatalogIds.push(id);
  }

  if (deleteCatalogIds.length > 0) {
    // catalogId → id interno de la fila local (el delete es por PK).
    const rowIds = deleteCatalogIds
      .map((catalogId) => existingByCatalogId.get(catalogId)?.id)
      .filter((id): id is string => Boolean(id));

    if (rowIds.length > 0) {
      await prisma.exercise.deleteMany({ where: { id: { in: rowIds } } });
      mutated = true;
    }
    for (const catalogId of deleteCatalogIds) {
      results.push({ catalogId, ok: true });
    }
  }

  if (createIds.length > 0) {
    // El snapshot completo no viaja por el cliente — a cada incluido nuevo se le pide el detalle
    // fresco a la API (/api/exercises/:id?lang=es), así la fila local queda fiel a la fuente.
    const details = await fetchDetails(createIds);
    const snapshots: Prisma.ExerciseCreateManyInput[] = [];

    for (const id of createIds) {
      const detail = details.get(id);
      if (!detail?.id || !detail.name) {
        results.push({
          catalogId: id,
          ok: false,
          error: "El catálogo no devolvió el detalle del ejercicio.",
        });
        continue;
      }
      snapshots.push(toSnapshot(admin.branchId, detail));
      results.push({ catalogId: id, ok: true });
    }

    if (snapshots.length > 0) {
      await prisma.exercise.createMany({ data: snapshots, skipDuplicates: true });
      mutated = true;
    }
  }

  if (mutated) {
    revalidatePath("/admin/ejercicios");
  }

  return { results };
}

async function fetchDetails(ids: string[]): Promise<Map<string, ApiExerciseDetail | null>> {
  const details = new Map<string, ApiExerciseDetail | null>();

  for (let index = 0; index < ids.length; index += DETAIL_CHUNK_SIZE) {
    const chunk = ids.slice(index, index + DETAIL_CHUNK_SIZE);
    const settled = await Promise.all(
      chunk.map(async (id): Promise<[string, ApiExerciseDetail | null]> => {
        try {
          const response = await fetchCatalog<{ data: ApiExerciseDetail }>(
            `/api/exercises/${id}`,
            { lang: "es" },
            CATALOG_CACHE.meta
          );
          return [id, response.data];
        } catch {
          return [id, null];
        }
      })
    );
    for (const [id, detail] of settled) details.set(id, detail);
  }

  return details;
}

// Toggle individual (ficha de detalle): delega en la versión por lotes.
export async function toggleExerciseAction(
  include: boolean,
  catalogId: string
): Promise<ToggleExerciseResult> {
  const result = await applyTogglesAction([{ catalogId, include }]);
  const item = result.results[0];

  if (!item) return { ok: false, error: "No se pudo aplicar el cambio." };
  return item.ok ? { ok: true } : { ok: false, error: item.error };
}
