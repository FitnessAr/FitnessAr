import { requireAdmin } from "@/features/admin/require-admin";
import { EjercicioFormScreen } from "@/features/admin/catalogo/ejercicio-form-screen";
import { CATALOG_CACHE, fetchCatalog, isCatalogConfigured } from "@/features/admin/catalogo/catalog-api";
import type { CatalogMeta } from "@/features/admin/catalogo/types";

// Solo se necesita el vocabulario del catálogo (meta) para poblar los selects: NO se trae el
// listado completo. Si la API falla, el form igual renderiza con selects vacíos y el banner
// genérico del layout no aplica acá (el admin reintenta recargando).
async function loadMeta(): Promise<CatalogMeta> {
  if (!isCatalogConfigured()) {
    return {
      category: [],
      body_part: [],
      equipment: [],
      muscle_group: [],
      target: [],
    };
  }
  try {
    const response = await fetchCatalog<{ data: CatalogMeta }>(
      "/api/exercises/meta",
      undefined,
      CATALOG_CACHE.meta
    );
    return response.data;
  } catch {
    return {
      category: [],
      body_part: [],
      equipment: [],
      muscle_group: [],
      target: [],
    };
  }
}

// Alta de un ejercicio propio: formulario en blanco + selector de animación.
export default async function NuevoEjercicioPage() {
  await requireAdmin();
  const meta = await loadMeta();

  return <EjercicioFormScreen mode="create" meta={meta} />;
}
