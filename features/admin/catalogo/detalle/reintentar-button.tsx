"use client";

// Isla mínima de cliente para el banner de error de páginas server-side: refresca la ruta
// y vuelve a correr el loader (mismo mecanismo que el Reintentar del catálogo).
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";

export function ReintentarButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => router.refresh())}
      disabled={isPending}
      className="flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-full bg-danger px-4 text-xs font-extrabold uppercase tracking-wide text-background transition-opacity active:opacity-80 disabled:opacity-40"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RotateCcw className="h-4 w-4" />
      )}
      Reintentar
    </button>
  );
}
