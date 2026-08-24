// Fallback de ruta para la ficha del ejercicio: aparece al instante mientras el server trae
// el detalle (Prisma o, si no está incluido, la API del catálogo global — puede tardar en
// frío). Replica el layout de la página para que no haya saltos.
export default function EjercicioDetalleLoading() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-5 px-6 pb-16 pt-8 lg:max-w-4xl">
      <div
        aria-hidden
        className="h-11 w-24 animate-pulse rounded-2xl bg-surface-elevated"
      />

      <div aria-hidden className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="h-5 w-24 animate-pulse rounded-full bg-surface-elevated" />
          <div className="h-6 w-11 shrink-0 animate-pulse rounded-full bg-surface-elevated" />
        </div>
        <div className="h-3 w-3/4 animate-pulse rounded-full bg-surface-elevated" />
      </div>

      <div aria-hidden className="grid items-start gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="aspect-square w-full animate-pulse rounded-2xl bg-surface-elevated" />
        <div className="flex flex-col gap-4">
          <div className="h-7 w-2/3 animate-pulse rounded-full bg-surface-elevated" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-16 animate-pulse rounded-2xl border border-border bg-surface" />
            <div className="h-16 animate-pulse rounded-2xl border border-border bg-surface" />
          </div>
          <div className="h-4 w-1/3 animate-pulse rounded-full bg-surface-elevated" />
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-20 animate-pulse rounded-full bg-surface-elevated" />
            <div className="h-6 w-24 animate-pulse rounded-full bg-surface-elevated" />
            <div className="h-6 w-16 animate-pulse rounded-full bg-surface-elevated" />
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="h-3 w-full animate-pulse rounded-full bg-surface-elevated" />
            <div className="h-3 w-11/12 animate-pulse rounded-full bg-surface-elevated" />
            <div className="h-3 w-4/5 animate-pulse rounded-full bg-surface-elevated" />
          </div>
        </div>
      </div>
    </div>
  );
}
