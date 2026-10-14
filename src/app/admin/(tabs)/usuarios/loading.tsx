export default function UsuariosLoading() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-6 pt-8">
      <div aria-hidden className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="h-3 w-28 animate-pulse rounded-full bg-surface-elevated" />
          <div className="h-7 w-44 animate-pulse rounded-full bg-surface-elevated" />
        </div>
        <div className="h-10 w-20 shrink-0 animate-pulse rounded-full bg-surface-elevated" />
      </div>

      <div
        aria-hidden
        className="h-12 w-full animate-pulse rounded-2xl bg-surface-elevated"
      />

      <div aria-hidden className="flex gap-1.5 overflow-hidden">
        <div className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-surface-elevated" />
        <div className="h-9 w-32 shrink-0 animate-pulse rounded-full bg-surface-elevated" />
        <div className="h-9 w-28 shrink-0 animate-pulse rounded-full bg-surface-elevated" />
      </div>

      <div aria-hidden className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3">
            <div className="aspect-square w-full animate-pulse rounded-xl bg-surface-elevated" />
            <div className="space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded-full bg-surface-elevated" />
              <div className="h-3 w-1/2 animate-pulse rounded-full bg-surface-elevated" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
