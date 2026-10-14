import { CatalogoSkeleton } from "@/features/admin/catalogo/catalogo-skeleton";

// Fallback de ruta para /admin/ejercicios: aparece al instante mientras el server arma la
// página completa (catálogo entero + estado de inclusión), tanto al entrar como al volver
// desde una ficha. Replica el layout de la pantalla para que no haya saltos.
export default function EjerciciosLoading() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-6 pt-8">
      <div aria-hidden className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="h-3 w-28 animate-pulse rounded-full bg-surface-elevated" />
          <div className="h-7 w-56 animate-pulse rounded-full bg-surface-elevated" />
        </div>
        <div className="h-10 w-20 shrink-0 animate-pulse rounded-full bg-surface-elevated" />
      </div>

      <div
        aria-hidden
        className="h-12 w-full animate-pulse rounded-2xl bg-surface-elevated"
      />

      <div aria-hidden className="flex gap-1.5 overflow-hidden">
        <div className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-surface-elevated" />
        <div className="h-9 w-28 shrink-0 animate-pulse rounded-full bg-surface-elevated" />
        <div className="h-9 w-32 shrink-0 animate-pulse rounded-full bg-surface-elevated" />
      </div>

      <div aria-hidden className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div className="h-11 animate-pulse rounded-2xl bg-surface-elevated" />
        <div className="h-11 animate-pulse rounded-2xl bg-surface-elevated" />
        <div className="hidden h-11 animate-pulse rounded-2xl bg-surface-elevated sm:block" />
      </div>

      <CatalogoSkeleton vista="cards" />
    </div>
  );
}
