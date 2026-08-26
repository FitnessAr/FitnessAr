import { prisma } from "@/lib/db";
import {
  CATALOG_CACHE,
  catalogMediaUrl,
  fetchCatalog,
  isCatalogConfigured,
} from "./catalog-api";
import type { CatalogExercise, CatalogMeta, CatalogoData } from "./types";

// TamaÃ±o de pÃ¡gina que acepta la API por request (clamp interno del catÃ¡logo).
const API_BATCH_SIZE = 100;
// Techo defensivo anti-explosiÃ³n de payload: el catÃ¡logo hoy tiene ~1324 ejercicios; si algÃºn
// dÃ­a creara Ã³rdenes de magnitud mÃ¡s, se corta igual (y counts.total refleja lo traÃ­do).
const MAX_ITEMS = 5000;

type ApiExercise = {
  id: string;
  name: string;
  category: string | null;
  bodyPart: string | null;
  equipment: string | null;
  muscleGroup: string | null;
  target: string | null;
  gifUrl: string | null;
};

function toCatalogExercise(raw: ApiExercise): CatalogExercise {
  return {
    id: raw.id,
    name: raw.name,
    category: raw.category,
    bodyPart: raw.bodyPart,
    equipment: raw.equipment,
    muscleGroup: raw.muscleGroup,
    target: raw.target,
    gifUrl: catalogMediaUrl(raw.gifUrl),
  };
}

// Trae el catÃ¡logo COMPLETO en batches: la primera pÃ¡gina da el total real y las restantes se
// piden en paralelo. Cada URL (offset distinto) queda cacheada individualmente por el Data
// Cache con el mismo TTL, asÃ­ que en caliente esto no golpea la API externa.
async function fetchAllExercises(): Promise<CatalogExercise[]> {
  const first = await fetchCatalog<{ data: ApiExercise[]; total: number }>(
    "/api/exercises",
    { lang: "es", offset: "0", limit: String(API_BATCH_SIZE) },
    CATALOG_CACHE.lists
  );

  const total = Math.min(first.total, MAX_ITEMS);
  const offsets: number[] = [];
  for (let offset = first.data.length; offset < total; offset += API_BATCH_SIZE) {
    offsets.push(offset);
  }

  // Una pÃ¡gina fallida no tumba la carga entera: entra vacÃ­a y el catÃ¡logo queda recortado
  // hasta el prÃ³ximo refresh con cachÃ© fresca.
  const pages = await Promise.all(
    offsets.map((offset) =>
      fetchCatalog<{ data: ApiExercise[] }>(
        "/api/exercises",
        { lang: "es", offset: String(offset), limit: String(API_BATCH_SIZE) },
        CATALOG_CACHE.lists
      )
        .then((result) => result.data)
        .catch(() => [] as ApiExercise[])
    )
  );

  // Dedupe por id (defensivo): si el catÃ¡logo cambia entre requests, las pÃ¡ginas podrÃ­an solapar.
  const byId = new Map<string, CatalogExercise>();
  for (const raw of [...first.data, ...pages.flat()]) {
    if (byId.size >= MAX_ITEMS) break;
    if (!byId.has(raw.id)) byId.set(raw.id, toCatalogExercise(raw));
  }
  return [...byId.values()];
}

// Los ejercicios propios (isCustom=true) viven SOLO en la tabla local: se traen aparte y se
// anteponen al catÃ¡logo global para que sean lo primero que se ve.
function customRowToCatalogExercise(
  row: {
    catalogId: string;
    name: string;
    category: string | null;
    equipment: string | null;
    muscleGroup: string | null;
    target: string | null;
    gifUrl: string | null;
  }
): CatalogExercise {
  return {
    id: row.catalogId,
    name: row.name,
    category: row.category,
    bodyPart: null,
    equipment: row.equipment,
    muscleGroup: row.muscleGroup,
    target: row.target,
    // La URL de Supabase Storage ya es absoluta https â€” no necesita resoluciÃ³n.
    gifUrl: row.gifUrl,
    isCustom: true,
  };
}

export async function getCatalogoData(branchId: string): Promise<CatalogoData> {
  if (!isCatalogConfigured()) {
    throw new Error(
      "Faltan las variables de entorno CATALOG_API_URL / CATALOG_API_KEY."
    );
  }

  const [exerciseRows, exercises, meta] = await Promise.all([
    prisma.exercise.findMany({
      where: { branchId },
      select: {
        catalogId: true,
        isCustom: true,
        name: true,
        category: true,
        equipment: true,
        muscleGroup: true,
        target: true,
        gifUrl: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    fetchAllExercises(),
    fetchCatalog<{ data: CatalogMeta }>(
      "/api/exercises/meta",
      undefined,
      CATALOG_CACHE.meta
    ),
  ]);

  const customs = exerciseRows
    .filter((row) => row.isCustom)
    .map(customRowToCatalogExercise);

  const includedIds = exerciseRows.map((row) => row.catalogId);

  return {
    exercises: [...customs, ...exercises],
    meta: meta.data,
    counts: { total: customs.length + exercises.length },
    includedIds,
  };
}
