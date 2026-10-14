export default function ConfiguracionLoading() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-6 pb-28 pt-8">
      <div aria-hidden className="h-7 w-44 animate-pulse rounded-full bg-surface-elevated" />

      <div aria-hidden className="h-11 w-full animate-pulse rounded-full bg-surface-elevated" />

      <div aria-hidden className="flex flex-col gap-5">
        <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
          <div className="h-3 w-24 animate-pulse rounded-full bg-surface-elevated" />
          <div className="h-5 w-40 animate-pulse rounded-full bg-surface-elevated" />
          <div className="h-3 w-32 animate-pulse rounded-full bg-surface-elevated" />
        </div>
        <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
          <div className="h-3 w-40 animate-pulse rounded-full bg-surface-elevated" />
          <div className="h-4 w-full animate-pulse rounded-full bg-surface-elevated" />
          <div className="h-4 w-full animate-pulse rounded-full bg-surface-elevated" />
        </div>
      </div>
    </div>
  );
}
