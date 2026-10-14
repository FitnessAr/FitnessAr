import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/features/admin/require-admin";
import { EjercicioFormScreen } from "@/features/admin/catalogo/ejercicio-form-screen";
import type { CatalogMeta, CustomExerciseInput } from "@/features/admin/catalogo/types";

// Mismo vocabulario que la página de alta: selects poblados con las opciones del catálogo.
async function loadMeta(): Promise<CatalogMeta> {
  try {
    const { CATALOG_CACHE, fetchCatalog } = await import(
      "@/features/admin/catalogo/catalog-api"
    );
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

// Las columnas Json llegan como unknown desde Prisma: solo aceptamos arrays de strings.
function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

// Edición de un ejercicio propio. Si el id no existe o no es custom → mensaje de no editable
// (no notFound(): mantiene el layout del admin y el link de vuelta).
export default async function EditarEjercicioPage({
  params,
}: PageProps<"/admin/ejercicios/[catalogId]/editar">) {
  const admin = await requireAdmin();
  const { catalogId } = await params;

  const row = await prisma.exercise.findFirst({
    where: { branchId: admin.branchId, catalogId, isCustom: true },
  });

  if (!row) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-col gap-4 px-6 pt-8 lg:max-w-3xl">
        <div className="rounded-2xl border border-dashed border-border p-6 text-center">
          <p className="text-sm font-bold text-ink">
            Este ejercicio no existe o no es editable.
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Solo los ejercicios creados por vos pueden editarse.
          </p>
          <Link
            href="/admin/ejercicios"
            className="mt-3 inline-block text-xs font-bold uppercase tracking-wide text-brand transition-opacity active:opacity-70"
          >
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  const initial: CustomExerciseInput = {
    name: row.name,
    category: row.category ?? "",
    equipment: row.equipment ?? "",
    target: row.target ?? "",
    secondaryMuscles: toStringList(row.secondaryMuscles),
    instructionSteps: toStringList(row.instructionSteps),
    gifUrl: row.gifUrl,
  };

  return (
    <EjercicioFormScreen
      mode="edit"
      catalogId={row.catalogId}
      initial={initial}
      meta={await loadMeta()}
    />
  );
}
