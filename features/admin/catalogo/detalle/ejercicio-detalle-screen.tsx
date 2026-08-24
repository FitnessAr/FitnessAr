import { formatLabel } from "../filter-labels";
import type { EjercicioDetalle } from "./types";

// Ficha técnica del ejercicio: media + clasificación + musculatura + pasos.
// Server Component puro y sin conceptos de rol ni de inclusión — eso lo compone la página
// que la usa (hoy /admin/ejercicios/[catalogId]; cliente/profesor podrían reusarla después).
export function EjercicioDetalleScreen({ detalle }: { detalle: EjercicioDetalle }) {
  const media = detalle.gifUrl ?? detalle.imageUrl;

  const datos = [
    { label: "Categoría", value: detalle.category },
    { label: "Músculo objetivo", value: detalle.target },
  ].filter((row): row is { label: string; value: string } => Boolean(row.value));

  return (
    <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start lg:gap-x-10">
      <div className="flex flex-col gap-5 lg:sticky lg:top-8">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface-elevated">
          {media ? (
            <img
              src={media}
              alt={`Animación de ${detalle.name}`}
              className="aspect-square w-full object-cover"
            />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center">
              <span className="text-xs text-ink-muted">Sin imagen</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 text-center lg:items-start lg:text-left">
          <h1 className="text-xl font-black uppercase leading-tight text-ink lg:text-2xl">
            {detalle.name}
          </h1>
          <span className="rounded-full bg-surface-elevated px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
            {detalle.equipment ?? "Sin equipo"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {datos.length > 0 && (
          <div className="flex flex-col rounded-2xl border border-border bg-surface px-4">
            {datos.map((row, index) => (
              <div
                key={row.label}
                className={`flex items-center justify-between py-3.5 ${
                  index < datos.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className="text-sm text-ink-muted">{row.label}</span>
                <span className="text-sm font-semibold text-ink">
                  {formatLabel(row.value)}
                </span>
              </div>
            ))}
          </div>
        )}

        {detalle.secondaryMuscles.length > 0 && (
          <section className="flex flex-col gap-2.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
              Músculos secundarios
            </p>
            <div className="flex flex-wrap gap-1.5">
              {detalle.secondaryMuscles.map((muscle) => (
                <span
                  key={muscle}
                  className="rounded-full bg-surface-elevated px-3 py-1.5 text-xs font-semibold capitalize text-ink"
                >
                  {muscle}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Cómo se hace
          </p>
          {detalle.instructionSteps.length > 0 ? (
            <ol className="flex flex-col gap-3">
              {detalle.instructionSteps.map((step, index) => (
                <li key={`${index}-${step}`} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-xs font-bold text-brand">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-ink">{step}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-ink-muted">
              Sin instrucciones cargadas para este ejercicio.
            </p>
          )}
        </section>

        {detalle.attribution && (
          <p className="text-xs leading-relaxed text-ink-muted">
            Fuente: {detalle.attribution}
          </p>
        )}
      </div>
    </div>
  );
}
