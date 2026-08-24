"use client";

// Acciones de un ejercicio propio en su ficha: Editar (link al formulario precargado) y
// Eliminar (con confirmación; bloqueado con el mismo mensaje de uso que los toggles si está
// asignado a rutinas o entrenamientos). Al eliminar, vuelve al catálogo.
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { deleteCustomExerciseAction } from "../custom-actions";

export function CustomExerciseActions({
  catalogId,
  name,
}: {
  catalogId: string;
  name: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  // El borrado invalida la caché del listado: refrescar dentro de una transición evita que la
  // navegación de vuelta quede colgada del refresh.
  const [, startRefresh] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (
      !window.confirm(
        `¿Eliminar «${name}»? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    setError(null);
    setIsDeleting(true);
    const result = await deleteCustomExerciseAction(catalogId);
    setIsDeleting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    startRefresh(() => router.push("/admin/ejercicios"));
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`grid gap-2 ${error ? "" : "sm:grid-cols-[1fr_1fr]"}`}
      >
        <Link
          href={`/admin/ejercicios/${catalogId}/editar`}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-surface-elevated text-xs font-extrabold uppercase tracking-wide text-ink transition-opacity active:opacity-80"
        >
          <Pencil className="h-4 w-4" />
          Editar
        </Link>
        <button
          type="button"
          onClick={() => void handleDelete()}
          disabled={isDeleting}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-danger/10 text-xs font-extrabold uppercase tracking-wide text-danger transition-opacity active:opacity-80 disabled:opacity-60"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          {isDeleting ? "Eliminando…" : "Eliminar"}
        </button>
      </div>
      {error && (
        <p className="rounded-xl bg-danger/10 px-3 py-2 text-xs font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
