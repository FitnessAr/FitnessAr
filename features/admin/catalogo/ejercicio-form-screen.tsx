"use client";

// Formulario de alta/edición de un ejercicio propio. Compartido por /admin/ejercicios/nuevo y
// /admin/ejercicios/[catalogId]/editar: cambia el título, la acción que se invoca y el destino
// al terminar. Los selects se alimentan con el vocabulario del catálogo global (data.meta), así
// los customs quedan filtrables junto a los demás en la vista catálogo.
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Loader2, X } from "lucide-react";
import { createCustomExerciseAction, updateCustomExerciseAction } from "./custom-actions";
import { MediaPicker } from "./media-picker";
import { CATEGORY_TARGETS, formatLabel } from "./filter-labels";
import type { CatalogMeta, CustomExerciseInput } from "./types";

type FormScreenProps =
  | { mode: "create"; meta: CatalogMeta }
  | {
      mode: "edit";
      catalogId: string;
      initial: CustomExerciseInput;
      meta: CatalogMeta;
    };

function SelectField({
  label,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string }[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
        {label}
      </span>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
          className={`min-h-12 w-full appearance-none truncate rounded-2xl border bg-surface px-4 pr-10 text-sm font-bold focus:border-brand focus:outline-none ${
            value ? "border-brand/60 text-ink" : "border-border text-ink-muted"
          }`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {formatLabel(option.value)}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
      </span>
    </label>
  );
}

export function EjercicioFormScreen(props: FormScreenProps) {
  const router = useRouter();
  const [name, setName] = useState(props.mode === "edit" ? props.initial.name : "");
  const [category, setCategory] = useState(
    props.mode === "edit" ? props.initial.category : ""
  );
  const [equipment, setEquipment] = useState(
    props.mode === "edit" ? props.initial.equipment : ""
  );
  const [target, setTarget] = useState(
    props.mode === "edit" ? props.initial.target : ""
  );
  const [secondaryMuscles, setSecondaryMuscles] = useState<string[]>(
    props.mode === "edit" ? props.initial.secondaryMuscles : []
  );
  const [stepsText, setStepsText] = useState(
    props.mode === "edit" ? props.initial.instructionSteps.join("\n") : ""
  );
  const [gifUrl, setGifUrl] = useState<string | null>(
    props.mode === "edit" ? props.initial.gifUrl : null
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Si hay categoría elegida, el target se limita a los válidos para esa categoría (misma
  // regla que usan los filtros del catálogo).
  const allowedTargets = category ? CATEGORY_TARGETS[category] : undefined;
  const targetOptions = allowedTargets
    ? props.meta.target.filter((option) => allowedTargets.includes(option.value))
    : props.meta.target;

  function addSecondary(value: string) {
    if (!value || secondaryMuscles.includes(value)) return;
    setSecondaryMuscles((prev) => [...prev, value]);
  }

  function buildInput(): CustomExerciseInput {
    return {
      name,
      category,
      equipment,
      target,
      secondaryMuscles,
      // Un paso por línea no vacía; el server recorta longitud y cantidad.
      instructionSteps: stepsText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
      gifUrl,
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result =
      props.mode === "edit"
        ? await updateCustomExerciseAction(props.catalogId, buildInput())
        : await createCustomExerciseAction(buildInput());

    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push(`/admin/ejercicios/${result.catalogId}`);
  }

  const secondaryOptions = props.meta.target.filter(
    (option) =>
      option.value !== target && !secondaryMuscles.includes(option.value)
  );

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-8 px-6 pb-28 pt-8 lg:max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black uppercase leading-tight text-ink">
          {props.mode === "edit" ? "Editar ejercicio" : "Nuevo ejercicio"}
        </h1>
        <Link
          href={props.mode === "edit" ? `/admin/ejercicios/${props.catalogId}` : "/admin/ejercicios"}
          aria-label="Cerrar"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-elevated text-ink-muted"
        >
          <X className="h-4 w-4" />
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-6">
          <MediaPicker value={gifUrl} onChange={setGifUrl} />

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
              Nombre
            </span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={255}
              placeholder="Ej. Sentadilla búlgara con mancuernas"
              className="rounded-2xl border border-border bg-surface px-4 py-3.5 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none"
            />
          </label>
        </div>

        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-x-6">
          <SelectField
            label="Categoría"
            value={category}
            options={props.meta.category}
            placeholder="Elegir categoría"
            onChange={(value) => {
              setCategory(value);
              // El target elegido puede quedar fuera de la nueva categoría: resetearlo.
              const allowed = value ? CATEGORY_TARGETS[value] : undefined;
              if (allowed && target && !allowed.includes(target)) setTarget("");
            }}
          />

          <SelectField
            label="Equipo"
            value={equipment}
            options={props.meta.equipment}
            placeholder="Elegir equipo"
            onChange={setEquipment}
          />

          <div className="lg:col-span-2">
            <SelectField
              label="Músculo objetivo"
              value={target}
              options={targetOptions}
              placeholder="Elegir músculo objetivo"
              onChange={setTarget}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Músculos secundarios (opcional)
          </span>
          {secondaryMuscles.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {secondaryMuscles.map((muscle) => (
                <button
                  key={muscle}
                  type="button"
                  onClick={() =>
                    setSecondaryMuscles((prev) => prev.filter((item) => item !== muscle))
                  }
                  title="Quitar"
                  className="flex items-center gap-1 rounded-full bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:text-danger"
                >
                  {formatLabel(muscle)}
                  <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          )}
          <span className="relative block">
            <select
              value=""
              onChange={(event) => addSecondary(event.target.value)}
              aria-label="Agregar músculo secundario"
              className="min-h-12 w-full appearance-none truncate rounded-2xl border border-border bg-surface px-4 pr-10 text-sm font-bold text-ink-muted focus:border-brand focus:outline-none"
            >
              <option value="">+ Agregar músculo secundario</option>
              {secondaryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {formatLabel(option.value)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          </span>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Instrucciones (opcional)
          </span>
          <textarea
            value={stepsText}
            onChange={(event) => setStepsText(event.target.value)}
            rows={5}
            placeholder={"Un paso por línea.\nEj. Apoyá un pie detrás sobre el banco."}
            className="rounded-2xl border border-border bg-surface px-4 py-3.5 text-sm leading-relaxed text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none"
          />
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-brand text-base font-extrabold uppercase tracking-wide text-brand-foreground transition-opacity active:opacity-80 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
          {isSubmitting
            ? "Guardando…"
            : props.mode === "edit"
              ? "Guardar cambios"
              : "Crear ejercicio"}
        </button>
      </form>
    </div>
  );
}
