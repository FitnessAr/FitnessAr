import { requireAdmin } from "@/features/admin/require-admin";
import { getCatalogoData } from "@/features/admin/catalogo/get-catalogo-data";
import { CatalogoScreen } from "@/features/admin/catalogo/catalogo-screen";
import type {
  CatalogoEstado,
  CatalogoFilters,
  CatalogoVista,
} from "@/features/admin/catalogo/types";

const ESTADOS: CatalogoEstado[] = ["todos", "incluidos", "excluidos"];
const VISTAS: CatalogoVista[] = ["cards", "lista"];
const MAX_PAGE = 200; // techo defensivo contra URLs manuales absurdas

function firstValue(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function parseFilters(
  searchParams: Record<string, string | string[] | undefined>
): CatalogoFilters {
  const estadoRaw = firstValue(searchParams.estado);
  const vistaRaw = firstValue(searchParams.vista);
  const pageRaw = Number.parseInt(firstValue(searchParams.pagina), 10);

  return {
    q: firstValue(searchParams.q).trim().slice(0, 100),
    bodyPart: firstValue(searchParams.cuerpo),
    category: firstValue(searchParams.categoria),
    equipment: firstValue(searchParams.equipo),
    muscleGroup: firstValue(searchParams.grupo),
    target: firstValue(searchParams.objetivo),
    estado: ESTADOS.includes(estadoRaw as CatalogoEstado)
      ? (estadoRaw as CatalogoEstado)
      : "todos",
    vista: VISTAS.includes(vistaRaw as CatalogoVista)
      ? (vistaRaw as CatalogoVista)
      : "cards",
    page: Number.isInteger(pageRaw) && pageRaw > 0 ? Math.min(pageRaw, MAX_PAGE) : 1,
  };
}

export default async function EjerciciosPage({
  searchParams,
}: PageProps<"/admin/ejercicios">) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const filters = parseFilters(params);

  let data: Awaited<ReturnType<typeof getCatalogoData>> | null = null;
  let errorMessage: string | undefined;

  try {
    data = await getCatalogoData(admin.branchId, filters);
  } catch (error) {
    // Falla la API del catálogo o falta config: se muestra el banner con Reintentar
    // en vez de romper toda la pestaña.
    errorMessage =
      error instanceof Error
        ? error.message
        : "No se pudo conectar con el catálogo global.";
  }

  return <CatalogoScreen data={data} filters={filters} error={errorMessage} />;
}
