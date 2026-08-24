"use client";

// Pantalla del Catálogo: búsqueda + filtros por URL (searchParams son la fuente de verdad),
// pills Todos/Incluidos/No incluidos con conteos globales y vista grilla/lista.
//
// Filtros: los controles (pills/selects/vista) reflejan el valor pedido AL INSTANTE vía
// useOptimistic; mientras llega la respuesta se muestran skeletons (cambio de filtro/búsqueda)
// o la grilla anterior atenuada con spinner (paginar). Los refresh de fondo van por otra
// transición (startRefresh) y no tocan el valor optimista → no disparan esos estados.
//
// Toggles: cada click pinta su estado (overrides) y ENCOLA la operación; un flush con debounce
// las persiste EN LOTE vía applyTogglesAction con un único refresh. Los ítems que fallan
// revierten solos y avisan por toast.
import {
  useCallback,
  useEffect,
  useMemo,
  useOptimistic,
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
import { applyTogglesAction } from "./actions";
import type { ApplyTogglesResult, ToggleOp } from "./actions";
import { ToastStack, useToasts } from "@/components/toast";
import { CatalogoSkeleton } from "./catalogo-skeleton";
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

const BATCH_FLUSH_SIZE = 5;
const BATCH_DEBOUNCE_MS = 700;
// Distancia al final del scroll a la que se dispara la auto-carga de la página siguiente.
const AUTO_LOAD_ROOT_MARGIN = "320px";

type NavMode = "filters" | "page" | null;

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
  // fuera del render. Se escribe sincrónicamente en update() y en efecto al llegar props.
  const filtersRef = useRef(filters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Segunda transición SOLO para refreshes de fondo (post-flush, reintentar): si usaran la
  // misma, prenderían los estados optimistas de navegación que no les corresponden.
  const [isRefreshing, startRefresh] = useTransition();

  // Controles optimistas vía useOptimistic: mientras la navegación está pendiente, pills/
  // selects/vista muestran el valor pedido y el contenido reacciona según el modo; al terminar
  // la transición vuelve el valor de los props (ya sincronizados). Sin efectos ni refs.
  const [view, setViewOptimistic] = useOptimistic(
    { filters, navMode: null as NavMode },
    (
      current: { filters: CatalogoFilters; navMode: NavMode },
      action: { patch: Partial<CatalogoFilters>; mode: NavMode }
    ) => {
      const next: CatalogoFilters = { ...current.filters, ...action.patch };
      if (!("page" in action.patch)) next.page = 1;
      return { filters: next, navMode: action.mode };
    }
  );
  const viewFilters = view.filters;
  const navMode: NavMode = view.navMode;

  // Cambia filtros y navega (router.replace: no llena el historial mientras se filtra).
  // Cualquier patch que no traiga page explícita vuelve a la página 1.
  const update = useCallback(
    (patch: Partial<CatalogoFilters>) => {
      const next: CatalogoFilters = { ...filtersRef.current, ...patch };
      if (!("page" in patch)) next.page = 1;
      filtersRef.current = next;
      const qs = buildQuery(next);
      startTransition(() => {
        setViewOptimistic({
          patch,
          mode: "page" in patch ? "page" : "filters",
        });
        router.replace(qs ? `/admin/ejercicios?${qs}` : "/admin/ejercicios", {
          scroll: false,
        });
      });
    },
    [router, setViewOptimistic, startTransition]
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

  // Toggle optimista con cola: overrides[id] gana sobre includedIds hasta que el refresh trae
  // datos frescos. Las operaciones viajan juntas en un solo action (flush por debounce o
  // tamaño de lote) y los ítems rechazados revierten individualmente con toast.
  const includedSet = useMemo(
    () => new Set(data?.includedIds ?? []),
    [data?.includedIds]
  );
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const queueRef = useRef(new Map<string, boolean>());
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flushingRef = useRef(false);
  const [savingOps, setSavingOps] = useState(0);
  const [isFlushing, setIsFlushing] = useState(false);
  const { toasts, pushToast, dismissToast } = useToasts();

  const isSaving = isFlushing || savingOps > 0;

  // Nota: los overrides exitosos no se "concilian" contra props frescas — un override que ya
  // coincide con el servidor es inofensivo (isIncluded devuelve lo mismo), y los fallidos se
  // revierten explícitamente en flushQueue.

  function isIncluded(id: string): boolean {
    return overrides[id] ?? includedSet.has(id);
  }

  async function flushQueue() {
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    if (flushingRef.current || queueRef.current.size === 0) return;

    const ops: ToggleOp[] = [...queueRef.current].map(([catalogId, include]) => ({
      catalogId,
      include,
    }));
    queueRef.current.clear();
    flushingRef.current = true;
    setIsFlushing(true);

    let result: ApplyTogglesResult | null = null;
    try {
      try {
        result = await applyTogglesAction(ops);
      } catch {
        pushToast("No se pudo guardar. Reintentá en unos segundos.");
      }

      if (result) {
        for (const item of result.results) {
          if (item.ok) continue;
          // Solo el ítem fallido vuelve al estado real del servidor.
          setOverrides((prev) => {
            if (!(item.catalogId in prev)) return prev;
            const rest = { ...prev };
            delete rest[item.catalogId];
            return rest;
          });
          pushToast(item.error);
        }
        // Un único refresh para todo el lote (los overrides ya coinciden con la BD).
        startRefresh(() => router.refresh());
      } else {
        // Falló el envío completo: devolver todos al estado del servidor.
        setOverrides({});
      }
    } finally {
      flushingRef.current = false;
      setIsFlushing(false);
      setSavingOps(queueRef.current.size);
      // Si el usuario siguió tocando switches durante el flush, se manda el resto.
      if (queueRef.current.size > 0) void flushQueue();
    }
  }

  function handleToggle(exercise: CatalogExercise) {
    const next = !isIncluded(exercise.id);

    setOverrides((prev) => ({ ...prev, [exercise.id]: next }));

    queueRef.current.set(exercise.id, next);
    setSavingOps(queueRef.current.size);

    if (queueRef.current.size >= BATCH_FLUSH_SIZE) {
      void flushQueue();
      return;
    }
    if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(() => void flushQueue(), BATCH_DEBOUNCE_MS);
  }

  useEffect(
    () => () => {
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    },
    []
  );

  // Auto-carga: sentinel bajo la grilla; al acercarse al final pide la página siguiente por
  // URL igual que "Cargar más". El armed exige que el sentinel salga del viewport entre
  // disparos para no encadenar páginas sin que el usuario scrollee.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const autoLoadRef = useRef({ busy: false, page: 1, hasMore: false });
  const sentinelArmedRef = useRef(true);

  useEffect(() => {
    autoLoadRef.current = {
      busy: isPending || isRefreshing || isFlushing || savingOps > 0,
      page: viewFilters.page,
      hasMore: Boolean(data?.hasMore),
    };
  });

  useEffect(() => {
    const element = sentinelRef.current;
    if (!element || !data?.hasMore) return;
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
        const state = autoLoadRef.current;
        if (state.busy || !state.hasMore) return;
        sentinelArmedRef.current = false;
        update({ page: state.page + 1 });
      },
      { rootMargin: AUTO_LOAD_ROOT_MARGIN }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [data?.hasMore, update]);

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
      category: "",
      equipment: "",
      target: "",
      estado: "todos",
    });
  }

  // navMode solo es distinto de null mientras hay una navegación de filtros/página en vuelo:
  // los refresh de fondo van por otra transición y no tocan el valor optimista.
  const loadingResults = navMode !== null;
  const showSkeletons = navMode === "filters";
  const dimGrid = navMode === "page";

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
            aria-pressed={viewFilters.vista === "cards"}
            onClick={() => update({ vista: "cards" })}
            className={`rounded-full p-2 transition-colors ${
              viewFilters.vista === "cards"
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
            aria-pressed={viewFilters.vista === "lista"}
            onClick={() => update({ vista: "lista" })}
            className={`rounded-full p-2 transition-colors ${
              viewFilters.vista === "lista"
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
          value={searchDraft}
          onChange={(event) => setSearchDraft(event.target.value)}
          placeholder="Buscar por nombre…"
          aria-label="Buscar ejercicios por nombre"
          className="min-h-12 w-full rounded-2xl border border-border bg-surface pl-11 pr-10 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-muted focus:border-brand/60"
        />
        {searchDraft ? (
          <button
            type="button"
            onClick={() => setSearchDraft("")}
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
              viewFilters.estado === pill.key
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
            def.field === "target" && viewFilters.category
              ? CATEGORY_TARGETS[viewFilters.category]
              : undefined;
          const options = allowedTargets
            ? allOptions.filter((option) =>
                allowedTargets.includes(option.value)
              )
            : allOptions;
          return (
            <div key={def.field} className="relative">
              <select
                value={viewFilters[def.field]}
                onChange={(event) => {
                  const value = event.target.value;
                  if (def.field === "category") {
                    const patch: Partial<CatalogoFilters> = { category: value };
                    const allowed = value ? CATEGORY_TARGETS[value] : undefined;
                    if (
                      allowed &&
                      viewFilters.target &&
                      !allowed.includes(viewFilters.target)
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
                  viewFilters[def.field] ? "border-brand/60" : "border-border"
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
        <p className="flex items-center gap-2 text-xs text-ink-muted">
          Mostrando{" "}
          <span className="font-bold text-ink">{exercises.length}</span> de{" "}
          {effectiveTotal.toLocaleString("es-AR")}
          {loadingResults && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" />
          )}
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

      {showSkeletons ? (
        <CatalogoSkeleton vista={viewFilters.vista} />
      ) : exercises.length > 0 ? (
        <div className="relative">
          <div
            className={
              dimGrid ? "pointer-events-none opacity-40 transition-opacity" : undefined
            }
          >
            {viewFilters.vista === "cards" ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {exercises.map((exercise) => (
                  <EjercicioCard
                    key={exercise.id}
                    exercise={exercise}
                    included={isIncluded(exercise.id)}
                    onToggle={() => handleToggle(exercise)}
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
                    onToggle={() => handleToggle(exercise)}
                  />
                ))}
              </div>
            )}
          </div>

          {dimGrid && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-brand" />
            </div>
          )}
        </div>
      ) : (
        !error &&
        !loadingResults && (
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

      {Boolean(data?.hasMore) && !showSkeletons && (
        <>
          <div ref={sentinelRef} aria-hidden className="h-px w-full" />

          <button
            type="button"
            onClick={() => update({ page: viewFilters.page + 1 })}
            disabled={isPending}
            className="mx-auto mt-1 flex min-h-12 items-center gap-2 rounded-full bg-surface-elevated px-6 text-xs font-extrabold uppercase tracking-wide text-ink transition-colors hover:bg-border disabled:opacity-40"
          >
            {loadingResults && navMode === "page" && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Cargar más
          </button>
        </>
      )}

      {isSaving && (
        <div className="fixed bottom-24 left-4 z-40 flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 shadow-lg shadow-black/40">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" />
          <span className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">
            Guardando…
          </span>
        </div>
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
