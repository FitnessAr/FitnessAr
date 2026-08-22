import { prisma } from "@/lib/db";
import {
  CATALOG_CACHE,
  catalogMediaUrl,
  fetchCatalog,
  isCatalogConfigured,
} from "./catalog-api";
import type {
  CatalogExercise,
  CatalogMeta,
  CatalogoData,
  CatalogoEstado,
  CatalogoFilters,
} from "./types";

// Tamaño de página visible ("Cargar más" agrega una página por click).
export const PAGE_SIZE = 24;
// Máximo que acepta la API por request (clamp interno del catálogo).
const API_BATCH_SIZE = 100;
// Techo defensivo anti-loop: el catálogo hoy tiene ~1324 ejercicios; si algún día crece mucho
// más que esto, el recorrido con filtro de estado se corta igual (y matchedTotal queda null).
const MAX_BATCHES = 30;

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

function listParams(filters: CatalogoFilters, offset: number, limit: number) {
  const params: Record<string, string> = {
    lang: "es",
    offset: String(offset),
    limit: String(limit),
  };
  if (filters.q) params.q = filters.q;
  if (filters.bodyPart) params.body_part = filters.bodyPart;
  if (filters.category) params.category = filters.category;
  if (filters.equipment) params.equipment = filters.equipment;
  if (filters.muscleGroup) params.muscle_group = filters.muscleGroup;
  if (filters.target) params.target = filters.target;
  return params;
}

function passesEstado(
  estado: CatalogoEstado,
  isIncluded: boolean
): boolean {
  if (estado === "incluidos") return isIncluded;
  if (estado === "excluidos") return !isIncluded;
  return true;
}

// Recorre la lista filtrada de la API en batches hasta juntar los items visibles de la página
// acumulada. Con estado = todos corta apenas alcanza (casi siempre 1 request); con incluidos/
// excluidos tiene que recorrer todo para saber el conteo exacto y paginar bien.
async function fetchFilteredPage(
  filters: CatalogoFilters,
  includedSet: Set<string>
): Promise<Pick<CatalogoData, "exercises" | "filteredTotal" | "matchedTotal" | "hasMore">> {
  const wantThrough = filters.page * PAGE_SIZE;

  const matches: CatalogExercise[] = [];
  let filteredTotal = 0;
  let fetched = 0;

  for (let batch = 0; batch < MAX_BATCHES; batch += 1) {
    const result = await fetchCatalog<{ data: ApiExercise[]; total: number }>(
      "/api/exercises",
      listParams(filters, fetched, API_BATCH_SIZE),
      CATALOG_CACHE.lists
    );
    filteredTotal = result.total;
    fetched += result.data.length;

    for (const raw of result.data) {
      const exercise = toCatalogExercise(raw);
      if (passesEstado(filters.estado, includedSet.has(exercise.id))) {
        matches.push(exercise);
      }
    }

    // Sin estado, el filtro no descarta nada: alcanza con llegar a la página pedida.
    if (filters.estado === "todos" && matches.length >= wantThrough) break;
    if (result.data.length < API_BATCH_SIZE || fetched >= result.total) break;
  }

  // Solo se puede garantizar el conteo exacto si se recorrió la fuente completa (con filtro de
  // estado el recorrido siempre llega hasta el final; con "todos" suele cortarse en la página).
  const sourceExhausted = fetched >= filteredTotal;

  return {
    exercises: matches.slice(0, wantThrough),
    filteredTotal,
    matchedTotal: sourceExhausted ? matches.length : null,
    hasMore: matches.length > wantThrough || (matches.length === wantThrough && !sourceExhausted),
  };
}

export async function getCatalogoData(
  branchId: string,
  filters: CatalogoFilters
): Promise<CatalogoData> {
  if (!isCatalogConfigured()) {
    throw new Error(
      "Faltan las variables de entorno CATALOG_API_URL / CATALOG_API_KEY."
    );
  }

  const [includedRows, grandTotal, meta] = await Promise.all([
    prisma.exercise.findMany({
      where: { branchId },
      select: { catalogId: true },
      orderBy: { createdAt: "asc" },
    }),
    fetchCatalog<{ total: number }>("/api/exercises", { limit: "0" }, CATALOG_CACHE.meta),
    fetchCatalog<{ data: CatalogMeta }>("/api/exercises/meta", undefined, CATALOG_CACHE.meta),
  ]);

  const includedSet = new Set(includedRows.map((row) => row.catalogId));
  const page = await fetchFilteredPage(filters, includedSet);

  return {
    ...page,
    meta: meta.data,
    counts: { total: grandTotal.total, incluidos: includedSet.size },
    includedIds: [...includedSet],
  };
}
