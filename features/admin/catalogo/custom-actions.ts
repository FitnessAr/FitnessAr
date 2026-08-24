"use server";

// Alta / edición / borrado de ejercicios propios (isCustom=true). Viven en la MISMA tabla
// Exercise que los snapshots del catálogo global, con catalogId sintético "cus_XXXXXX": así la
// ficha detalle, el guardia de uso y todas las rutas existentes siguen funcionando sin cambios.
//
// Diferencias con un ejercicio del catálogo:
// - Sí se puede editar y borrar (los del catálogo solo se incluyen/quitan).
// - attribution fija "Ejercicio propio"; bodyPart/muscleGroup quedan null (el formulario no los
//   pide: target + categoría alcanzan para filtrar).
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/features/admin/require-admin";
import { deleteMediaObject, extractObjectPath, getSupabaseBaseUrl } from "./storage";
import type { CustomExerciseInput } from "./types";

export type CustomExerciseResult =
  | { ok: true; catalogId: string }
  | { ok: false; error: string };

const CUSTOM_ID_PREFIX = "cus_";
const MAX_STEPS = 20;
const MAX_STEP_LENGTH = 500;
const MAX_SECONDARY = 10;

function newCustomCatalogId(): string {
  // "cus_" + 6 hex = 10 caracteres exactos: entra en VarChar(10) y cumple
  // CATALOG_ID_PATTERN, así que las rutas /admin/ejercicios/[catalogId] lo aceptan.
  const random = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
  return `${CUSTOM_ID_PREFIX}${random}`;
}

function cleanList(value: unknown, maxItems: number, maxLength: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim().slice(0, maxLength) : ""))
    .filter((item) => item.length > 0)
    .slice(0, maxItems);
}

// gifUrl solo puede ser una URL pública de NUESTRO bucket (la genera /api/ejercicios/media):
// evita que alguien inyecte URLs arbitrarias desde un cliente manipulado.
function cleanGifUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const url = value.trim();
  const base = getSupabaseBaseUrl();
  if (!url.startsWith(`${base}/storage/v1/object/public/`)) return null;
  return url.slice(0, 500);
}

async function parseInput(
  input: CustomExerciseInput
): Promise<{ ok: true; data: ParsedInput } | { ok: false; error: string }> {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  if (!name) return { ok: false, error: "El nombre es obligatorio." };

  const category = typeof input.category === "string" ? input.category.trim() : "";
  if (!category) return { ok: false, error: "La categoría es obligatoria." };

  const equipment = typeof input.equipment === "string" ? input.equipment.trim() : "";
  if (!equipment) return { ok: false, error: "El equipo es obligatorio." };

  const target = typeof input.target === "string" ? input.target.trim() : "";
  if (!target) return { ok: false, error: "El músculo objetivo es obligatorio." };

  return {
    ok: true,
    data: {
      name: name.slice(0, 255),
      category: category.slice(0, 100),
      equipment: equipment.slice(0, 100),
      target: target.slice(0, 100),
      secondaryMuscles: cleanList(input.secondaryMuscles, MAX_SECONDARY, 100),
      instructionSteps: cleanList(input.instructionSteps, MAX_STEPS, MAX_STEP_LENGTH),
      gifUrl: cleanGifUrl(input.gifUrl),
    },
  };
}

type ParsedInput = {
  name: string;
  category: string;
  equipment: string;
  target: string;
  secondaryMuscles: string[];
  instructionSteps: string[];
  gifUrl: string | null;
};

// Campos compartidos por alta y edición (branchId/catalogId los agrega cada caller).
function toDbData(data: ParsedInput) {
  return {
    name: data.name,
    category: data.category,
    equipment: data.equipment,
    target: data.target,
    secondaryMuscles:
      data.secondaryMuscles.length > 0 ? data.secondaryMuscles : Prisma.DbNull,
    instructionSteps:
      data.instructionSteps.length > 0 ? data.instructionSteps : Prisma.DbNull,
    gifUrl: data.gifUrl,
    attribution: "Ejercicio propio",
    isCustom: true,
  };
}

export async function createCustomExerciseAction(
  input: CustomExerciseInput
): Promise<CustomExerciseResult> {
  const admin = await requireAdmin();
  const parsed = await parseInput(input);
  if (!parsed.ok) return parsed;

  // Reintento ante colisión de id sintético (1 entre millones, pero barato de cubrir).
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const created = await prisma.exercise.create({
        data: {
          ...toDbData(parsed.data),
          branchId: admin.branchId,
          catalogId: newCustomCatalogId(),
        },
        select: { catalogId: true },
      });
      revalidatePath("/admin/ejercicios");
      return { ok: true, catalogId: created.catalogId };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        attempt < 2
      ) {
        continue; // colisión de catalogId: regenerar e intentar de nuevo
      }
      return { ok: false, error: "No se pudo crear el ejercicio. Intentá de nuevo." };
    }
  }
  return { ok: false, error: "No se pudo crear el ejercicio. Intentá de nuevo." };
}

export async function updateCustomExerciseAction(
  catalogId: string,
  input: CustomExerciseInput
): Promise<CustomExerciseResult> {
  const admin = await requireAdmin();
  const parsed = await parseInput(input);
  if (!parsed.ok) return parsed;

  // Solo filas propias de esta sucursal y marcadas custom son editables.
  const existing = await prisma.exercise.findFirst({
    where: { branchId: admin.branchId, catalogId, isCustom: true },
    select: { id: true, gifUrl: true },
  });
  if (!existing) {
    return { ok: false, error: "El ejercicio no existe o no es editable." };
  }

  try {
    await prisma.exercise.update({
      where: { id: existing.id },
      data: toDbData(parsed.data),
    });
  } catch {
    return { ok: false, error: "No se pudo guardar el ejercicio. Intentá de nuevo." };
  }

  // Si se reemplazó la animación por otra (o se quitó), borrar el objeto viejo del storage.
  const oldObjectPath = extractObjectPath(existing.gifUrl ?? "");
  if (oldObjectPath && oldObjectPath !== extractObjectPath(parsed.data.gifUrl ?? "")) {
    void deleteMediaObject(oldObjectPath);
  }

  revalidatePath("/admin/ejercicios");
  revalidatePath(`/admin/ejercicios/${catalogId}`);
  return { ok: true, catalogId };
}

export async function deleteCustomExerciseAction(
  catalogId: string
): Promise<CustomExerciseResult> {
  const admin = await requireAdmin();

  const existing = await prisma.exercise.findFirst({
    where: { branchId: admin.branchId, catalogId, isCustom: true },
    select: {
      id: true,
      gifUrl: true,
      _count: { select: { routineExercises: true, sessionExercises: true } },
    },
  });
  if (!existing) {
    return { ok: false, error: "El ejercicio no existe o ya fue eliminado." };
  }

  const usage = existing._count.routineExercises + existing._count.sessionExercises;
  if (usage > 0) {
    return {
      ok: false,
      error:
        `Está siendo usado en ${existing._count.routineExercises} rutina(s) y ` +
        `${existing._count.sessionExercises} entrenamiento(s). Primero quitálo de ahí.`,
    };
  }

  try {
    await prisma.exercise.delete({ where: { id: existing.id } });
  } catch {
    return { ok: false, error: "No se pudo eliminar el ejercicio. Intentá de nuevo." };
  }

  const objectPath = extractObjectPath(existing.gifUrl ?? "");
  if (objectPath) void deleteMediaObject(objectPath);

  revalidatePath("/admin/ejercicios");
  return { ok: true, catalogId };
}
