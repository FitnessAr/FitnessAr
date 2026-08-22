// Cliente de la API del catálogo global (proyecto hermano exercise-catalog, deploy en Vercel).
// SOLO importar desde Server Components / Server Actions: las requests llevan la API key en el
// header x-api-key — si este módulo terminara en el bundle del cliente, la key quedaría pública.
//
// Caché: el contenido de la API no depende de nuestra BD (los incluidos son estado local), así
// que las respuestas se cachean con TTL y NO se invalidan al togglar. Cada call site elige TTL:
// meta/total y detalle (datos estables) → 24h; listados filtrados → 1h.

const BASE_URL = process.env.CATALOG_API_URL ?? "";
const API_KEY = process.env.CATALOG_API_KEY ?? "";

// TTLs de caché (segundos). El catálogo global es casi inmutable; si empieza a cambiar más
// seguido, bajar estos valores es suficiente.
const REVALIDATE_META = 60 * 60 * 24;
const REVALIDATE_LISTS = 60 * 60;

export const CATALOG_CACHE = {
  meta: { revalidate: REVALIDATE_META },
  lists: { revalidate: REVALIDATE_LISTS },
} as const;

export type FetchCatalogOptions = {
  revalidate?: number;
};

export function isCatalogConfigured(): boolean {
  return Boolean(BASE_URL && API_KEY);
}

export async function fetchCatalog<T>(
  path: string,
  params?: Record<string, string>,
  options?: FetchCatalogOptions
): Promise<T> {
  const url = new URL(path, BASE_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value) url.searchParams.set(key, value);
    }
  }

  // force-cache + revalidate es opt-in en Next 16: sin options sigue siendo no-store.
  const response = await fetch(url, {
    headers: { "x-api-key": API_KEY },
    ...(options?.revalidate
      ? { cache: "force-cache" as const, next: { revalidate: options.revalidate } }
      : { cache: "no-store" as const }),
  });

  if (!response.ok) {
    throw new Error(`El catálogo respondió ${response.status}`);
  }

  return (await response.json()) as T;
}

// gifUrl/image vienen como paths relativos al deploy del catálogo ("videos/0001-xxx.gif").
export function catalogMediaUrl(relativePath: string | null | undefined): string | null {
  if (!relativePath) return null;
  return `${BASE_URL.replace(/\/+$/, "")}/${relativePath.replace(/^\/+/, "")}`;
}
