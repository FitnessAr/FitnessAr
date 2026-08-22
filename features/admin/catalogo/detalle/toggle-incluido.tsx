"use client";

// Fila de estado del catálogo dentro de la ficha: badge Incluido/No incluido + interruptor.
// Mismo mecanismo que las cards del catálogo (toggleExerciseAction) pero con el resultado
// visible acá: éxito → router.refresh() reflota el snapshot/badge; bloqueo (ejercicio usado
// en rutinas) → se revierte y el mensaje del action queda inline.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { ToggleSwitch } from "../toggle-switch";
import { toggleExerciseAction } from "../actions";

export function ToggleIncluido({
  catalogId,
  name,
  included,
}: {
  catalogId: string;
  name: string;
  included: boolean;
}) {
  const router = useRouter();
  const [isIncluded, setIsIncluded] = useState(included);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    const next = !isIncluded;

    setError(null);
    setIsIncluded(next);
    setPending(true);

    const result = await toggleExerciseAction(next, catalogId);

    setPending(false);
    if (!result.ok) {
      setIsIncluded(!next);
      setError(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <div
      className={`flex flex-col gap-2 rounded-2xl border p-4 transition-colors ${
        isIncluded ? "border-brand/60 bg-surface" : "border-border bg-surface"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-h-6 items-center gap-1.5 text-sm font-bold text-ink">
          {isIncluded && (
            <Check
              className="h-4 w-4 rounded-full bg-brand p-0.5 text-brand-foreground"
              strokeWidth={3}
            />
          )}
          {isIncluded ? "Incluido" : "No incluido"}
        </span>
        <ToggleSwitch
          checked={isIncluded}
          disabled={pending}
          onChange={() => void handleToggle()}
          ariaLabel={
            isIncluded
              ? `Quitar ${name} del catálogo`
              : `Incluir ${name} en el catálogo`
          }
        />
      </div>

      <p className="text-xs leading-relaxed text-ink-muted">
        {isIncluded
          ? "Puede usarse en las rutinas de la sucursal."
          : "Vista previa del catálogo global — incluilo para poder asignarlo en rutinas."}
      </p>

      {error && (
        <p className="rounded-xl bg-danger/10 px-3 py-2 text-xs font-semibold leading-relaxed text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
