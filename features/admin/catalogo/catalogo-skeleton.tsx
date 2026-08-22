// Skeletons con la forma de cada vista del catálogo: se muestran mientras la navegación por
// filtros trae los resultados nuevos (el contenido anterior se reemplaza para que no haya
// parpadeo de layout). aria-hidden: es decorativo, el spinner junto a los conteos anuncia carga.
export function CatalogoSkeleton({ vista }: { vista: "cards" | "lista" }) {
  if (vista === "lista") {
    return (
      <div aria-hidden className="flex flex-col gap-2.5">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-2.5"
          >
            <div className="h-14 w-14 shrink-0 animate-pulse rounded-xl bg-surface-elevated" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-1/2 animate-pulse rounded-full bg-surface-elevated" />
              <div className="h-3 w-1/3 animate-pulse rounded-full bg-surface-elevated" />
            </div>
            <div className="h-6 w-10 shrink-0 animate-pulse rounded-full bg-surface-elevated" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
    >
      {Array.from({ length: 12 }, (_, index) => (
        <div
          key={index}
          className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface"
        >
          <div className="aspect-square w-full animate-pulse bg-surface-elevated" />
          <div className="flex flex-col gap-2 p-3">
            <div className="h-3.5 w-4/5 animate-pulse rounded-full bg-surface-elevated" />
            <div className="h-3 w-2/5 animate-pulse rounded-full bg-surface-elevated" />
            <div className="mt-1 flex items-center justify-between">
              <div className="h-4 w-16 animate-pulse rounded-full bg-surface-elevated" />
              <div className="h-6 w-10 animate-pulse rounded-full bg-surface-elevated" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
