import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/features/admin/require-admin";
import {
  CATALOG_ID_PATTERN,
  getEjercicioDetalle,
} from "@/features/admin/catalogo/detalle/get-ejercicio-detalle";
import { EjercicioDetalleScreen } from "@/features/admin/catalogo/detalle/ejercicio-detalle-screen";
import { ToggleIncluido } from "@/features/admin/catalogo/detalle/toggle-incluido";
import { ReintentarButton } from "@/features/admin/catalogo/detalle/reintentar-button";

// Ficha del ejercicio: estado de inclusión (toggle real, no placeholder) + ficha técnica
// completa. Datos: primero la fila local de la sucursal; si el ejercicio no está incluido,
// preview directo contra la API del catálogo global (getEjercicioDetalle).
export default async function EjercicioDetallePage({
  params,
}: PageProps<"/admin/ejercicios/[catalogId]">) {
  const admin = await requireAdmin();
  const { catalogId } = await params;

  const data = await getEjercicioDetalle(admin.branchId, catalogId);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-5 px-6 pb-16 pt-8 lg:max-w-4xl">
      <Link
        href="/admin/ejercicios"
        aria-label="Volver al catálogo"
        className="flex min-h-11 w-fit items-center gap-1.5 rounded-2xl bg-surface-elevated px-3 text-xs font-extrabold uppercase tracking-wide text-ink-muted transition-opacity active:opacity-80"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>

      {data ? (
        <>
          <ToggleIncluido
            catalogId={data.detalle.id}
            name={data.detalle.name}
            included={data.isIncluded}
          />
          <EjercicioDetalleScreen detalle={data.detalle} />
        </>
      ) : CATALOG_ID_PATTERN.test(catalogId) ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-danger/40 bg-danger/10 p-6 text-center">
          <p className="text-sm font-semibold text-danger">
            No se pudo cargar la ficha de este ejercicio.
          </p>
          <p className="text-xs leading-relaxed text-ink-muted">
            Puede que el ejercicio ya no exista en el catálogo global o que la
            conexión esté fallando.
          </p>
          <ReintentarButton />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-6 text-center">
          <p className="text-sm font-bold text-ink">
            Ese enlace no corresponde a un ejercicio válido.
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Volvé al catálogo y elegí un ejercicio de la lista.
          </p>
        </div>
      )}
    </div>
  );
}
