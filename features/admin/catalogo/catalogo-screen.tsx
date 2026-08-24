"use client";

// Pantalla del Catálogo: TODO el catálogo llega en `data` y el filtrado (búsqueda, selects,
// estado), la paginación y los conteos de las pills se resuelven EN MEMORIA — cambiar de
// sección o buscar es instantáneo, sin round-trip al server. La URL sigue reflejando los
// filtros vía window.history.replaceState (shallow routing) para que recargar/compartir
// mantenga la vista; back/forward no re-sincroniza el estado interno (caso marginal aceptado).
//
// Toggles: solo cambian estado local. Nada se escribe en la BD hasta apretar "Guardar cambios"
// o hasta el autoguardado (30s / pestaña oculta / aviso beforeunload) — ver use-pending-toggles.
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronDown,
  LayoutGrid,
  List,
  Loader2,
  Plus,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { EjercicioCard } from "./ejercicio-card";
import { EjercicioRow } from "./ejercicio-row";
import { usePendingToggles } from "./use-pending-toggles";
import { deleteCustomExerciseAction } from "./custom-actions";
import { ToastStack, useToasts } from "@/components/toast";
import type {
  CatalogExercise,
  CatalogoData,
  CatalogoEstado,
  CatalogoFilters,
} from "./types";
import { CATEGORY_TARGETS, formatLabel } from "./filter-labels";

const ESTADO_PILLS: { key: CatalogoEstado; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "incluidos", label: "Incluidos" },
  { key: "excluidos", label: "No incluidos" },
];

type FilterField = "category" | "equipment" | "target";

const SELECT_DEFS: {
  field: FilterField;
  metaKey: keyof CatalogoData["meta"];
  placeholder: string;
}[] = [
  { field: "category", metaKey: "category", placeholder: "Categoría" },
  { field: "target", metaKey: "target", placeholder: "Músculo objetivo" },
  { field: "equipment", metaKey: "equipment", placeholder: "Equipo" },
];

const PAGE_SIZE = 24;
// Distancia al final del scroll a la que se dispara la auto-carga de la página siguiente.
const AUTO_LOAD_ROOT_MARGIN = "320px";

function buildQuery(filters: CatalogoFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("categoria", filters.category);
  if (filters.equipment) params.set("equipo", filters.equipment);
  if (filters.target) params.set("objetivo", filters.target);
  if (filters.estado !== "todos") params.set("estado", filters.estado);
  if (filters.vista !== "cards") params.set("vista", filters.vista);
  if (filters.page > 1) params.set("pagina", String(filters.page));
  return params.toString();
}

export function CatalogoScreen({
  data,
  initialFilters,
  error,
}: {
  data: CatalogoData | null;
  initialFilters: CatalogoFilters;
  error?: string;
}) {
  const router = useRouter();
  // Segunda transición SOLO para el reintento tras un error de carga (router.refresh).
  const [isRefreshing, startRefresh] = useTransition();

  // Filtros 100% client-side: se inicializan de la URL y después viven acá.
  const [filters, setFilters] = useState(initialFilters);
  const filtersRef = useRef(filters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const { toasts, pushToast, dismissToast } = useToasts();
  const { effectiveIncluded, toggle, save, isSaving, pendingCount } =
    usePendingToggles(data?.includedIds ?? [], pushToast);

  // Cambia filtros y sincroniza la URL sin navegación server-side (shallow routing):
  // cualquier patch que no traiga page explícita vuelve a la página 1.
  const update = useCallback((patch: Partial<CatalogoFilters>) => {
    const next: CatalogoFilters = { ...filtersRef.current, ...patch };
    if (!("page" in patch)) next.page = 1;
    filtersRef.current = next;
    setFilters(next);

    const qs = buildQuery(next);
    try {
      window.history.replaceState(
        null,
        "",
        qs ? `/admin/ejercicios?${qs}` : "/admin/ejercicios"
      );
    } catch {
      // Entorno sin history API (raro): el filtrado igual funciona, solo no se refleja en URL.
    }
  }, []);

  const allExercises = useMemo(() => data?.exercises ?? [], [data?.exercises]);

  // Borrado de un ejercicio propio (solo customs exponen el botón): confirmación nativa,
  // acción de server y refresco del listado; error → toast.
  async function handleDeleteCustom(exercise: CatalogExercise) {
    if (
      !window.confirm(`¿Eliminar «${exercise.name}»? Esta acción no se puede deshacer.`)
    ) {
      return;
    }
    const result = await deleteCustomExerciseAction(exercise.id);
    if (!result.ok) {
      pushToast(result.error);
      return;
    }
    startRefresh(() => router.refresh());
  }

  // Filtrado local: búsqueda por nombre + selects + estado (contra el set efectivo de
  // incluidos, que ya contempla toggles pendientes de guardar).
  const filteredExercises = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return allExercises.filter((exercise): exercise is CatalogExercise => {
      if (q && !exercise.name.toLowerCase().includes(q)) return false;
      if (filters.category && exercise.category !== filters.category)
        return false;
      if (filters.equipment && exercise.equipment !== filters.equipment)
        return false;
      if (filters.target && exercise.target !== filters.target) return false;
      if (filters.estado === "incluidos" && !effectiveIncluded.has(exercise.id))
        return false;
      if (filters.estado === "excluidos" && effectiveIncluded.has(exercise.id))
        return false;
      return true;
    });
  }, [allExercises, filters, effectiveIncluded]);

  // Paginación local ("Cargar más"/auto-load agregan una página por click).
  const visibleCount = filters.page * PAGE_SIZE;
  const visibleExercises = filteredExercises.slice(0, visibleCount);
  const hasMore = filteredExercises.length > visibleCount;

  // Auto-carga: sentinel bajo la grilla; al acercarse al final pide la página siguiente en
  // memoria. El armed exige que el sentinel salga del viewport entre disparos para no
  // encadenar páginas sin que el usuario scrollee.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const sentinelArmedRef = useRef(true);

  useEffect(() => {
    const element = sentinelRef.current;
    if (!element || !hasMore) return;
    if (typeof IntersectionObserver === "undefined") return;

    sentinelArmedRef.current = true;

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.some((entry) => entry.isIntersecting);
        if (!intersecting) {
          sentinelArmedRef.current = true;
          return;
        }
        if (!sentinelArmedRef.current) return;
        sentinelArmedRef.current = false;
        update({ page: filtersRef.current.page + 1 });
      },
      { rootMargin: AUTO_LOAD_ROOT_MARGIN }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasMore, update]);

  const total = data?.counts.total ?? 0;
  const incluidosCount = Math.min(effectiveIncluded.size, total);
  const excluidosCount = Math.max(total - incluidosCount, 0);
  const pillCounts: Record<CatalogoEstado, number> = {
    todos: total,
    incluidos: incluidosCount,
    excluidos: excluidosCount,
  };

  const hasActiveFilters =
    Boolean(filters.q.trim()) ||
    filters.estado !== "todos" ||
    SELECT_DEFS.some((def) => Boolean(filters[def.field]));

  function clearFilters() {
    update({
      q: "",
      category: "",
      equipment: "",
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

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/admin/ejercicios/nuevo"
            className="flex min-h-9 items-center gap-1 rounded-full bg-brand px-3 text-[11px] font-extrabold uppercase tracking-wide text-brand-foreground transition-opacity active:opacity-80"
          >
            <Plus className="h-4 w-4" />
            Crear
          </Link>
          <div className="flex items-center rounded-full bg-surface-elevated p-1">
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
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-danger/40 bg-danger/10 p-4">
          <p className="text-sm font-semibold text-danger">{error}</p>
          <button
            type="button"
            onClick={() => startRefresh(() => router.refresh())}
            disabled={isRefreshing}
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
          value={filters.q}
          onChange={(event) => update({ q: event.target.value })}
          placeholder="Buscar por nombre…"
          aria-label="Buscar ejercicios por nombre"
          className="min-h-12 w-full rounded-2xl border border-border bg-surface pl-11 pr-10 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-muted focus:border-brand/60"
        />
        {filters.q ? (
          <button
            type="button"
            onClick={() => update({ q: "" })}
            aria-label="Limpiar búsqueda"
            title="Limpiar búsqueda"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted transition-colors hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
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

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {SELECT_DEFS.map((def) => {
          const allOptions = data?.meta[def.metaKey] ?? [];
          const allowedTargets =
            def.field === "target" && filters.category
              ? CATEGORY_TARGETS[filters.category]
              : undefined;
          const options = allowedTargets
            ? allOptions.filter((option) =>
                allowedTargets.includes(option.value)
              )
            : allOptions;
          return (
            <div key={def.field} className="relative">
              <select
                value={filters[def.field]}
                onChange={(event) => {
                  const value = event.target.value;
                  if (def.field === "category") {
                    const patch: Partial<CatalogoFilters> = { category: value };
                    const allowed = value ? CATEGORY_TARGETS[value] : undefined;
                    if (
                      allowed &&
                      filters.target &&
                      !allowed.includes(filters.target)
                    ) {
                      patch.target = "";
                    }
                    update(patch);
                    return;
                  }
                  update({ [def.field]: value } as Partial<CatalogoFilters>);
                }}
                aria-label={def.placeholder}
                className={`min-h-11 w-full appearance-none truncate rounded-2xl border bg-surface px-3 pr-8 text-xs font-bold text-ink outline-none transition-colors focus:border-brand/60 ${
                  filters[def.field] ? "border-brand/60" : "border-border"
                }`}
              >
                <option value="">{def.placeholder}</option>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {formatLabel(option.value)}
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
          Mostrando{" "}
          <span className="font-bold text-ink">{visibleExercises.length}</span>{" "}
          de {filteredExercises.length.toLocaleString("es-AR")}
        </p>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="shrink-0 text-xs font-bold uppercase tracking-wide text-brand transition-opacity active:opacity-70"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {visibleExercises.length > 0 ? (
        <>
          {filters.vista === "cards" ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {/* AnimatePresence: al togglar en una vista filtrada el ítem sale del listado
                  (el filtro lo excluye al instante); sin esto se desmontaba sin animación.
                  popLayout saca al que sale del flujo y layout reacomoda al resto. */}
              <AnimatePresence mode="popLayout" initial={false}>
                {visibleExercises.map((exercise) => (
                  <motion.div
                    key={exercise.id}
                    layout
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25 }}
                    className="h-full"
                  >
                    <EjercicioCard
                      exercise={exercise}
                      included={effectiveIncluded.has(exercise.id)}
                      onToggle={() => toggle(exercise.id)}
                      onDelete={
                        exercise.isCustom
                          ? () => void handleDeleteCustom(exercise)
                          : undefined
                      }
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <AnimatePresence mode="popLayout" initial={false}>
                {visibleExercises.map((exercise) => (
                  <motion.div
                    key={exercise.id}
                    layout
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.25 }}
                  >
                    <EjercicioRow
                      exercise={exercise}
                      included={effectiveIncluded.has(exercise.id)}
                      onToggle={() => toggle(exercise.id)}
                      onDelete={
                        exercise.isCustom
                          ? () => void handleDeleteCustom(exercise)
                          : undefined
                      }
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
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

      {hasMore && (
        <>
          <div ref={sentinelRef} aria-hidden className="h-px w-full" />

          <button
            type="button"
            onClick={() => update({ page: filters.page + 1 })}
            className="mx-auto mt-1 flex min-h-12 items-center gap-2 rounded-full bg-surface-elevated px-6 text-xs font-extrabold uppercase tracking-wide text-ink transition-colors hover:bg-border"
          >
            Cargar más
          </button>
        </>
      )}

      {(pendingCount > 0 || isSaving) && (
        <div className="fixed inset-x-0 bottom-24 z-40 flex justify-center px-4">
          <button
            type="button"
            onClick={() => void save()}
            disabled={isSaving}
            className="flex min-h-12 items-center gap-2 rounded-full bg-brand px-6 text-xs font-extrabold uppercase tracking-wide text-brand-foreground shadow-lg shadow-black/40 transition-opacity active:opacity-80 disabled:opacity-60"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSaving
              ? "Guardando…"
              : `Guardar cambios (${pendingCount})`}
          </button>
        </div>
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
