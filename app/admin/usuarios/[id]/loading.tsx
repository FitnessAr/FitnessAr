export default function UsuarioDetalleLoading() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-5 px-6 pt-8 md:max-w-2xl lg:max-w-4xl">
      <div
        aria-hidden
        className="h-11 w-28 shrink-0 animate-pulse rounded-2xl bg-surface-elevated"
      />

      <div aria-hidden className="grid gap-2 sm:grid-cols-[1fr_1fr]">
        <div className="h-12 animate-pulse rounded-2xl bg-surface-elevated" />
        <div className="h-12 animate-pulse rounded-2xl bg-surface-elevated" />
      </div>

      <div aria-hidden className="grid items-start gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="flex flex-col gap-4">
          <div className="aspect-square w-full animate-pulse rounded-2xl bg-surface-elevated" />
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-40 animate-pulse rounded-full bg-surface-elevated" />
            <div className="h-5 w-24 animate-pulse rounded-full bg-surface-elevated" />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col rounded-2xl border border-border bg-surface px-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`flex items-center justify-between py-3.5 ${
                  i < 2 ? "border-b border-border" : ""
                }`}
              >
                <div className="h-4 w-16 animate-pulse rounded-full bg-surface-elevated" />
                <div className="h-4 w-24 animate-pulse rounded-full bg-surface-elevated" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
