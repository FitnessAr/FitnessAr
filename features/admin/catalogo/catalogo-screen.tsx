"use client";

// Pantalla del Catálogo: búsqueda + filtros por URL (searchParams son la fuente de verdad),
// pills Todos/Incluidos/No incluidos con conteos globales, vista grilla/lista y toggles
// optimistas para incluir/quitar ejercicios (persistencia vía toggleExerciseAction).
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutGrid,
  List,
  Loader2,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { EjercicioCard } from "./ejercicio-card";
import { EjercicioRow } from "./ejercicio-row";
import { toggleExerciseAction } from "./actions";
import type {
  CatalogExercise,
  CatalogoData,
  CatalogoEstado,
  CatalogoFilters,
} from "./types";

const ESTADO_PILLS: { key: CatalogoEstado; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "incluidos", label: "Incluidos" },
  { key: "excluidos", label: "No incluidos" },
];

type FilterField =
  | "bodyPart"
  | "category"
  | "equipment"
  | "muscleGroup"
  | "target";

const SELECT_DEFS: {
  field: FilterField;
  metaKey: keyof CatalogoData["meta"];
  placeholder: string;
}[] = [
  { field: "bodyPart", metaKey: "body_part", placeholder: "Parte del cuerpo" },
  { field: "category", metaKey: "category", placeholder: "Categoría" },
  { field: "equipment", metaKey: "equipment", placeholder: "Equipo" },
  { field: "muscleGroup", metaKey: "muscle_group", placeholder: "Grupo muscular" },
  { field: "target", metaKey: "target", placeholder: "Objetivo" },
];

function buildQuery(filters: CatalogoFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.bodyPart) params.set("cuerpo", filters.bodyPart);
  if (filters.category) params.set("categoria", filters.category);
  if (filters.equipment) params.set("equipo", filters.equipment);
  if (filters.muscleGroup) params.set("grupo", filters.muscleGroup);
  if (filters.target) params.set("objetivo", filters.target);
  if (filters.estado !== "todos") params.set("estado", filters.estado);
  if (filters.vista !== "cards") params.set("vista", filters.vista);
  if (filters.page > 1) params.set("pagina", String(filters.page));
  return params.toString();
}

export function CatalogoScreen({
  data,
  filters,
  error,
}: {
  data: CatalogoData | null;
  filters: CatalogoFilters;
  error?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Últimos filtros conocidos: lo leen el debounce del buscador y los handlers, que corren
  // fuera del render. La escritura va en efecto (regla react-hooks/refs).
  const filtersRef = useRef(filters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Cambia filtros y navega (router.replace: no llena el historial mientras se filtra).
  // Cualquier patch que no traiga page explícita vuelve a la página 1.
  const update = useCallback(
    (patch: Partial<CatalogoFilters>) => {
      const next: CatalogoFilters = { ...filtersRef.current, ...patch };
      if (!("page" in patch)) next.page = 1;
      const qs = buildQuery(next);
      startTransition(() => {
        router.replace(qs ? `/admin/ejercicios?${qs}` : "/admin/ejercicios", {
          scroll: false,
        });
      });
    },
    [router]
  );

  // El input de búsqueda es local; se commitea a la URL 400ms después de dejar de tipear.
  // (No se re-sincroniza desde la URL en cada render: clearFilters resetea el draft a mano,
  // y back/forward es un caso marginal aceptable.)
  const [searchDraft, setSearchDraft] = useState(filters.q);

  useEffect(() => {
    const value = searchDraft.trim();
    if (value === filtersRef.current.q) return;
    const timer = setTimeout(() => update({ q: value }), 400);
    return () => clearTimeout(timer);
  }, [searchDraft, update]);

  // Toggle optimista: overrides[id] gana sobre includedIds hasta que llega el refresh.
  const includedSet = useMemo(
    () => new Set(data?.includedIds ?? []),
    [data?.includedIds]
  );
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);

  function isIncluded(id: string): boolean {
    return overrides[id] ?? includedSet.has(id);
  }

  async function handleToggle(exercise: CatalogExercise) {
    const currentlyIncluded = isIncluded(exercise.id);
    const next = !currentlyIncluded;

    setOverrides((prev) => ({ ...prev, [exercise.id]: next }));
    setPendingId(exercise.id);

    const result = await toggleExerciseAction(next, exercise.id);

    setPendingId(null);
    if (!result.ok) {
      // Revertir el estado visual y avisar (ej.: ejercicio usado en rutinas).
      setOverrides((prev) => {
        const rest = { ...prev };
        delete rest[exercise.id];
        return rest;
      });
      window.alert(result.error);
      return;
    }

    startTransition(() => router.refresh());
  }

  const total = data?.counts.total ?? 0;
  const incluidosCount = data?.counts.incluidos ?? 0;
  const excluidosCount = Math.max(total - incluidosCount, 0);
  const pillCounts: Record<CatalogoEstado, number> = {
    todos: total,
    incluidos: incluidosCount,
    excluidos: excluidosCount,
  };

  const exercises = data?.exercises ?? [];
  // Con filtro de estado el conteo exacto solo existe si se recorrió toda la fuente.
  const effectiveTotal =
    filters.estado === "todos"
      ? (data?.filteredTotal ?? 0)
      : (data?.matchedTotal ?? data?.filteredTotal ?? 0);

  const hasActiveFilters =
    Boolean(filters.q) ||
    filters.estado !== "todos" ||
    SELECT_DEFS.some((def) => Boolean(filters[def.field]));

  function clearFilters() {
    setSearchDraft("");
    update({
      q: "",
      bodyPart: "",
      category: "",
      equipment: "",
      muscleGroup: "",
      target: "",
      estado: "todos",
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-6 pb-28 pt-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Catálogo global
          </p>
          <h1 className="text-2xl font-black uppercase leading-tight text-ink">
            {total.toLocaleString("es-AR")} ejercicios
          </h1>
        </div>

        <div className="flex shrink-0 items-center rounded-full bg-surface-elevated p-1">
          <button
            type="button"
            title="Vista tarjetas"
            aria-label="Vista tarjetas"
            aria-pressed={filters.vista === "cards"}
            onClick={() => update({ vista: "cards" })}
            className={`rounded-full p-2 transition-colors ${
              filters.vista === "cards"
                ? "bg-brand text-brand-foreground"
                : "text-ink-muted"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Vista lista"
            aria-label="Vista lista"
            aria-pressed={filters.vista === "lista"}
            onClick={() => update({ vista: "lista" })}
            className={`rounded-full p-2 transition-colors ${
              filters.vista === "lista"
                ? "bg-brand text-brand-foreground"
                : "text-ink-muted"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-danger/40 bg-danger/10 p-4">
          <p className="text-sm font-semibold text-danger">{error}</p>
          <button
            type="button"
            onClick={() => startTransition(() => router.refresh())}
            disabled={isPending}
            className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-danger px-4 text-xs font-extrabold uppercase tracking-wide text-background transition-opacity active:opacity-80 disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" />
            Reintentar
          </button>
        </div>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          type="text"
          value={searchDraft}
          onChange={(event) => setSearchDraft(event.target.value)}
          placeholder="Buscar por nombre…"
          aria-label="Buscar ejercicios por nombre"
          className="min-h-12 w-full rounded-2xl border border-border bg-surface pl-11 pr-10 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-muted focus:border-brand/60"
        />
        {searchDraft && (
          <button
            type="button"
            onClick={() => setSearchDraft("")}
            aria-label="Limpiar búsqueda"
            title="Limpiar búsqueda"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted transition-colors hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-nowrap gap-1.5 overflow-x-auto">
        {ESTADO_PILLS.map((pill) => (
          <button
            key={pill.key}
            type="button"
            onClick={() => update({ estado: pill.key })}
            className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-bold transition-colors ${
              filters.estado === pill.key
                ? "bg-brand text-brand-foreground"
                : "bg-surface-elevated text-ink-muted"
            }`}
          >
            {pill.label} {pillCounts[pill.key]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {SELECT_DEFS.map((def) => {
          const options = data?.meta[def.metaKey] ?? [];
          return (
            <div key={def.field} className="relative">
              <select
                value={filters[def.field]}
                onChange={(event) =>
                  update({
                    [def.field]: event.target.value,
                  } as Partial<CatalogoFilters>)
                }
                aria-label={def.placeholder}
                className="min-h-11 w-full appearance-none truncate rounded-2xl border border-border bg-surface px-3 pr-8 text-xs font-bold text-ink outline-none transition-colors focus:border-brand/60"
              >
                <option value="">{def.placeholder}</option>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.value} ({option.count})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-ink-muted">
          Mostrando <span className="font-bold text-ink">{exercises.length}</span>{" "}
          de {effectiveTotal.toLocaleString("es-AR")}
        </p>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            disabled={isPending}
            className="shrink-0 text-xs font-bold uppercase tracking-wide text-brand transition-opacity active:opacity-70 disabled:opacity-40"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {exercises.length > 0 ? (
        filters.vista === "cards" ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {exercises.map((exercise) => (
              <EjercicioCard
                key={exercise.id}
                exercise={exercise}
                included={isIncluded(exercise.id)}
                pending={pendingId === exercise.id}
                onToggle={() => void handleToggle(exercise)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {exercises.map((exercise) => (
              <EjercicioRow
                key={exercise.id}
                exercise={exercise}
                included={isIncluded(exercise.id)}
                pending={pendingId === exercise.id}
                onToggle={() => void handleToggle(exercise)}
              />
            ))}
          </div>
        )
      ) : (
        !error && (
          <div className="rounded-2xl border border-dashed border-border py-12 text-center">
            <p className="text-sm font-bold text-ink">
              {hasActiveFilters
                ? "No se encontraron ejercicios."
                : "El catálogo está vacío."}
            </p>
            {hasActiveFilters && (
              <p className="mt-1 text-xs text-ink-muted">
                Probá ajustar la búsqueda o los filtros.
              </p>
            )}
          </div>
        )
      )}

      {Boolean(data?.hasMore) && (
        <button
          type="button"
          onClick={() => update({ page: filters.page + 1 })}
          disabled={isPending}
          className="mx-auto mt-1 flex min-h-12 items-center gap-2 rounded-full bg-surface-elevated px-6 text-xs font-extrabold uppercase tracking-wide text-ink transition-colors hover:bg-border disabled:opacity-40"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Cargar más
        </button>
      )}
    </div>
  );
}
