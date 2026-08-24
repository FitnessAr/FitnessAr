import { prisma } from "@/lib/db";
import {
  CATALOG_CACHE,
  catalogMediaUrl,
  fetchCatalog,
  isCatalogConfigured,
} from "./catalog-api";
import type { CatalogExercise, CatalogMeta, CatalogoData } from "./types";

// Tamaño de página que acepta la API por request (clamp interno del catálogo).
const API_BATCH_SIZE = 100;
// Techo defensivo anti-explosión de payload: el catálogo hoy tiene ~1324 ejercicios; si algún
// día creara órdenes de magnitud más, se corta igual (y counts.total refleja lo traído).
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

// Trae el catálogo COMPLETO en batches: la primera página da el total real y las restantes se
// piden en paralelo. Cada URL (offset distinto) queda cacheada individualmente por el Data
// Cache con el mismo TTL, así que en caliente esto no golpea la API externa.
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

  // Una página fallida no tumba la carga entera: entra vacía y el catálogo queda recortado
  // hasta el próximo refresh con caché fresca.
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

  // Dedupe por id (defensivo): si el catálogo cambia entre requests, las páginas podrían solapar.
  const byId = new Map<string, CatalogExercise>();
  for (const raw of [...first.data, ...pages.flat()]) {
    if (byId.size >= MAX_ITEMS) break;
    if (!byId.has(raw.id)) byId.set(raw.id, toCatalogExercise(raw));
  }
  return [...byId.values()];
}

export async function getCatalogoData(branchId: string): Promise<CatalogoData> {
  if (!isCatalogConfigured()) {
    throw new Error(
      "Faltan las variables de entorno CATALOG_API_URL / CATALOG_API_KEY."
    );
  }

  const [includedRows, exercises, meta] = await Promise.all([
    prisma.exercise.findMany({
      where: { branchId },
      select: { catalogId: true },
      orderBy: { createdAt: "asc" },
    }),
    fetchAllExercises(),
    fetchCatalog<{ data: CatalogMeta }>(
      "/api/exercises/meta",
      undefined,
      CATALOG_CACHE.meta
    ),
  ]);

  return {
    exercises,
    meta: meta.data,
    counts: { total: exercises.length },
    includedIds: includedRows.map((row) => row.catalogId),
  };
}
