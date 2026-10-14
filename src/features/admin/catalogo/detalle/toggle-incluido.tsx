"use client";

// Fila de estado del catálogo dentro de la ficha: nombre (editable solo si está incluido) +
// badge Incluido/No incluido + interruptor. Mismo mecanismo que las cards del catálogo
// (toggleExerciseAction) pero con el resultado visible acá: éxito → router.refresh() reflota el
// snapshot/badge; bloqueo (ejercicio usado en rutinas) → se revierte y el mensaje del action
// queda inline.
//
// El guardado (tanto el toggle como el rename) tiene DOS tramos lentos (el action y el refresh
// server-side de la ficha): mientras cualquiera corre, el badge muestra "Guardando…" con spinner
// para que no parezca que la app se congeló.
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Pencil } from "lucide-react";
import { ToggleSwitch } from "../toggle-switch";
import { toggleExerciseAction, renameExerciseAction } from "../actions";

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
  const [currentName, setCurrentName] = useState(name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(name);
  const [pending, setPending] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isRefreshing, startRefresh] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const busy = pending || isRenaming || isRefreshing;

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

    startRefresh(() => router.refresh());
  }

  async function handleSaveName() {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      setError("El nombre no puede estar vacío.");
      return;
    }

    setError(null);
    setIsRenaming(true);
    const previousName = currentName;
    setCurrentName(trimmed);

    const result = await renameExerciseAction(catalogId, trimmed);

    setIsRenaming(false);
    if (!result.ok) {
      setCurrentName(previousName);
      setError(result.error);
      return;
    }

    setIsEditingName(false);
    startRefresh(() => router.refresh());
  }

  function handleCancelEditName() {
    setNameDraft(currentName);
    setIsEditingName(false);
    setError(null);
  }

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border p-4 transition-colors ${
        isIncluded ? "border-brand/60 bg-surface" : "border-border bg-surface"
      }`}
    >
      {isIncluded &&
        (isEditingName ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              maxLength={255}
              autoFocus
              aria-label="Nombre del ejercicio"
              className="min-h-10 flex-1 rounded-xl border border-border bg-surface-elevated px-3 text-sm font-bold text-ink focus:border-brand focus:outline-none"
            />
            <button
              type="button"
              onClick={() => void handleSaveName()}
              disabled={busy}
              className="shrink-0 rounded-full bg-brand px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-brand-foreground transition-opacity disabled:opacity-50"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={handleCancelEditName}
              disabled={busy}
              className="shrink-0 rounded-full bg-surface-elevated px-3 py-2 text-xs font-bold text-ink-muted transition-opacity disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-bold text-ink">{currentName}</p>
            <button
              type="button"
              onClick={() => {
                setNameDraft(currentName);
                setIsEditingName(true);
              }}
              disabled={busy}
              aria-label={`Renombrar ${currentName}`}
              title="Renombrar"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-ink-muted transition-colors hover:text-ink disabled:opacity-40"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

      <div className="flex items-center justify-between gap-3">
        <span className="flex min-h-6 items-center gap-1.5 text-sm font-bold text-ink">
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-brand" />
              Guardando…
            </>
          ) : (
            <>
              {isIncluded && (
                <Check
                  className="h-4 w-4 rounded-full bg-brand p-0.5 text-brand-foreground"
                  strokeWidth={3}
                />
              )}
              {isIncluded ? "Incluido" : "No incluido"}
            </>
          )}
        </span>
        <ToggleSwitch
          checked={isIncluded}
          disabled={busy}
          onChange={() => void handleToggle()}
          ariaLabel={
            isIncluded
              ? `Quitar ${currentName} del catálogo`
              : `Incluir ${currentName} en el catálogo`
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
