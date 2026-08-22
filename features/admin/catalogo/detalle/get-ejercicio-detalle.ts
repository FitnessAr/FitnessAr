import { prisma } from "@/lib/db";
import {
  CATALOG_CACHE,
  catalogMediaUrl,
  fetchCatalog,
  isCatalogConfigured,
} from "../catalog-api";
import type { EjercicioDetalle, EjercicioDetalleData } from "./types";

// Mismo formato que acepta toggleExerciseAction para el id del catálogo.
export const CATALOG_ID_PATTERN = /^[A-Za-z0-9_-]{1,10}$/;

// Espejo del detalle de la API con lang=es — mismos campos que persiste actions.toSnapshot.
type ApiExerciseDetail = {
  id?: string;
  name?: string;
  category?: string | null;
  bodyPart?: string | null;
  equipment?: string | null;
  muscleGroup?: string | null;
  target?: string | null;
  secondaryMuscles?: unknown;
  instructionSteps?: unknown;
  image?: string | null;
  gifUrl?: string | null;
  attribution?: string | null;
};

function clampText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text ? text.slice(0, max) : null;
}

// Las columnas Json llegan como unknown desde Prisma: aceptamos solo arrays de strings
// (formato de la fuente), recortados por si algún día viniera basura.
const MAX_LIST_ITEMS = 40;

function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const items: string[] = [];
  for (const raw of value.slice(0, MAX_LIST_ITEMS)) {
    if (typeof raw !== "string") continue;
    const text = raw.trim();
    if (text) items.push(text);
  }
  return items;
}

function toDetalle(
  id: string,
  data: {
    name: string | null;
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
  }
): EjercicioDetalle {
  // La media se guarda/pide relativa al deploy del catálogo (convención de la API externa):
  // acá se resuelve a absoluta lista para <img>.
  return {
    id,
    name: data.name ?? "",
    category: clampText(data.category, 100),
    bodyPart: clampText(data.bodyPart, 100),
    equipment: clampText(data.equipment, 100),
    muscleGroup: clampText(data.muscleGroup, 100),
    target: clampText(data.target, 100),
    secondaryMuscles: toStringList(data.secondaryMuscles),
    instructionSteps: toStringList(data.instructionSteps),
    imageUrl: catalogMediaUrl(data.image),
    gifUrl: catalogMediaUrl(data.gifUrl),
    attribution: clampText(data.attribution, 500),
  };
}

// Ficha de ejercicio: primero la fila Exercise local (snapshot completo persistido al incluir);
// si no existe, preview directo contra la API del catálogo global. Devuelve null cuando el id es
// inválido, la API falla o el catálogo no está configurado y el ejercicio no está incluido —
// la página decide cómo mostrar ese vacío.
export async function getEjercicioDetalle(
  branchId: string,
  catalogId: string
): Promise<EjercicioDetalleData | null> {
  const id = String(catalogId ?? "").trim();
  if (!CATALOG_ID_PATTERN.test(id)) return null;

  const localRow = await prisma.exercise.findUnique({
    where: { branchId_catalogId: { branchId, catalogId: id } },
  });

  if (localRow) {
    return {
      detalle: toDetalle(id, {
        name: localRow.name,
        category: localRow.category,
        bodyPart: localRow.bodyPart,
        equipment: localRow.equipment,
        muscleGroup: localRow.muscleGroup,
        target: localRow.target,
        secondaryMuscles: localRow.secondaryMuscles,
        instructionSteps: localRow.instructionSteps,
        image: localRow.image,
        gifUrl: localRow.gifUrl,
        attribution: localRow.attribution,
      }),
      isIncluded: true,
    };
  }

  if (!isCatalogConfigured()) return null;

  let apiDetail: ApiExerciseDetail;
  try {
    const response = await fetchCatalog<{ data: ApiExerciseDetail }>(
      `/api/exercises/${id}`,
      { lang: "es" },
      CATALOG_CACHE.meta
    );
    apiDetail = response.data;
  } catch {
    return null;
  }

  const name = clampText(apiDetail.name, 255);
  if (!apiDetail?.id || !name) return null;

  return {
    detalle: toDetalle(id, {
      name,
      category: apiDetail.category ?? null,
      bodyPart: apiDetail.bodyPart ?? null,
      equipment: apiDetail.equipment ?? null,
      muscleGroup: apiDetail.muscleGroup ?? null,
      target: apiDetail.target ?? null,
      secondaryMuscles: apiDetail.secondaryMuscles ?? null,
      instructionSteps: apiDetail.instructionSteps ?? null,
      image: apiDetail.image ?? null,
      gifUrl: apiDetail.gifUrl ?? null,
      attribution: apiDetail.attribution ?? null,
    }),
    isIncluded: false,
  };
}
