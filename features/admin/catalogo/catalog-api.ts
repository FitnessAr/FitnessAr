// Cliente de la API del catálogo global (proyecto hermano exercise-catalog, deploy en Vercel).
// SOLO importar desde Server Components / Server Actions: las requests llevan la API key en el
// header x-api-key — si este módulo terminara en el bundle del cliente, la key quedaría pública.

const BASE_URL = process.env.CATALOG_API_URL ?? "";
const API_KEY = process.env.CATALOG_API_KEY ?? "";

export function isCatalogConfigured(): boolean {
  return Boolean(BASE_URL && API_KEY);
}

export async function fetchCatalog<T>(
  path: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(path, BASE_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value) url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url, {
    headers: { "x-api-key": API_KEY },
    cache: "no-store",
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
