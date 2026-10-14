"use client";

// Estado de inclusiones pendiente de guardar para el Catálogo.
//
// Los toggles SOLO cambian estado local: `baseIncluded` (lo que dice la BD al montar) +
// `overrides` (toggles aún sin confirmar). Nada toca la BD hasta `save()` — disparado por el
// botón "Guardar cambios", por un autoguardado cada 30s o al ocultar la pestaña. La cola se
// persiste en sessionStorage para sobrevivir un refresh con cambios sin guardar (es seguro:
// applyTogglesAction es idempotente y concilia contra el estado real del server).
import { useEffect, useMemo, useRef, useState } from "react";
import { applyTogglesAction } from "./actions";
import type { ApplyTogglesResult, ToggleOp } from "./actions";

const STORAGE_KEY = "fitnessar.catalogo.pending";
const AUTOSAVE_INTERVAL_MS = 30_000;

export function usePendingToggles(
  initialIncludedIds: string[],
  onError: (message: string) => void
) {
  const [baseIncluded, setBaseIncluded] = useState<Set<string>>(
    () => new Set(initialIncludedIds)
  );
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const queueRef = useRef(new Map<string, boolean>());
  const savingRef = useRef(false);
  const hydratedRef = useRef(false);
  const baseIncludedRef = useRef(baseIncluded);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    baseIncludedRef.current = baseIncluded;
  }, [baseIncluded]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  function persistQueue() {
    try {
      if (queueRef.current.size === 0) {
        sessionStorage.removeItem(STORAGE_KEY);
      } else {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify([...queueRef.current])
        );
      }
    } catch {
      // sessionStorage lleno o bloqueado: el flujo sigue, solo se pierde el filete de red.
    }
  }

  // Hidratación de la cola guardada (post-refresh con cambios sin guardar). En un efecto,
  // no en el initializer de useState: sessionStorage no existe durante el SSR.
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const ops = JSON.parse(raw) as ToggleOp[];
      if (!Array.isArray(ops)) return;
      for (const op of ops) {
        if (
          op &&
          typeof op.catalogId === "string" &&
          typeof op.include === "boolean"
        ) {
          queueRef.current.set(op.catalogId, op.include);
        }
      }
      if (queueRef.current.size > 0) {
        setOverrides(Object.fromEntries(queueRef.current));
        setPendingCount(queueRef.current.size);
      }
    } catch {
      // Entrada corrupta: descartarla.
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  }, []);

  // Set efectivo de incluidos (BD + overrides): alimenta filtrado por estado, conteos de las
  // pills e isIncluded de las cards.
  const effectiveIncluded = useMemo(() => {
    const set = new Set(baseIncluded);
    for (const [id, include] of Object.entries(overrides)) {
      if (include) set.add(id);
      else set.delete(id);
    }
    return set;
  }, [baseIncluded, overrides]);

  function toggle(id: string) {
    const current = queueRef.current.has(id)
      ? queueRef.current.get(id)!
      : baseIncludedRef.current.has(id);

    setOverrides((prev) => ({ ...prev, [id]: !current }));
    queueRef.current.set(id, !current);
    setPendingCount(queueRef.current.size);
    persistQueue();
  }

  async function save(): Promise<void> {
    if (savingRef.current || queueRef.current.size === 0) return;

    const ops: ToggleOp[] = [...queueRef.current].map(
      ([catalogId, include]) => ({ catalogId, include })
    );
    const attempted = new Set(ops.map((op) => op.catalogId));

    queueRef.current.clear();
    setPendingCount(0);
    persistQueue();

    savingRef.current = true;
    setIsSaving(true);

    let result: ApplyTogglesResult | null = null;
    try {
      result = await applyTogglesAction(ops);
    } catch {
      onErrorRef.current("No se pudo guardar. Reintentá en unos segundos.");
    }

    savingRef.current = false;
    setIsSaving(false);

    if (result) {
      const failed = new Map<string, string>();
      for (const item of result.results) {
        if (!item.ok) failed.set(item.catalogId, item.error);
      }

      // Éxitos: consolidarlos en la base local (la BD ya coincide — nada más que refrescar).
      const includes: string[] = [];
      const excludes: string[] = [];
      for (const op of ops) {
        if (failed.has(op.catalogId)) continue;
        (op.include ? includes : excludes).push(op.catalogId);
      }
      if (includes.length > 0 || excludes.length > 0) {
        setBaseIncluded((prev) => {
          const next = new Set(prev);
          for (const id of includes) next.add(id);
          for (const id of excludes) next.delete(id);
          return next;
        });
      }

      // Fallidos: revertir ese ítem al estado real del server y avisar por toast.
      if (failed.size > 0) {
        setOverrides((prev) => {
          const rest = { ...prev };
          for (const id of failed.keys()) delete rest[id];
          return rest;
        });
        for (const message of failed.values()) onErrorRef.current(message);
      }
    } else {
      // Falló el envío completo: devolver todos los intentados al estado del server.
      setOverrides((prev) => {
        const rest = { ...prev };
        for (const id of attempted) delete rest[id];
        return rest;
      });
    }

    // Si el usuario siguió tocando switches durante el guardado, mandar el resto ya.
    if (queueRef.current.size > 0) void save();
  }

  // El intervalo/visibilitychange corren fuera del render: leen la función vigente vía ref.
  const saveRef = useRef<() => Promise<void>>(save);
  useEffect(() => {
    saveRef.current = save;
  });

  // Autoguardado periódico: si hay cambios pendientes, se envían solos.
  useEffect(() => {
    const timer = setInterval(() => {
      if (queueRef.current.size > 0) void saveRef.current();
    }, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  // Al ocultar la pestaña (cambio de app, minimizar), flushear lo pendiente.
  useEffect(() => {
    function onVisibilityChange() {
      if (
        document.visibilityState === "hidden" &&
        queueRef.current.size > 0
      ) {
        void saveRef.current();
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  // Aviso del navegador si el usuario cierra/recarga con cambios sin guardar.
  useEffect(() => {
    if (pendingCount === 0) return;
    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [pendingCount]);

  return { effectiveIncluded, toggle, save, isSaving, pendingCount };
}
