"use client";

import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutGrid,
  List,
  Plus,
  Search,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { UserCard } from "./user-card";
import { UserRow } from "./user-row";
import { setUserActiveAction, deleteUserAction } from "./actions";
import type { AdminUserRow, UsuariosData } from "./types";

type Filter = "all" | "ADMIN" | "PROFESOR" | "CLIENTE";
type Vista = "cards" | "lista";

const ESTADO_PILLS: { key: Filter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "ADMIN", label: "Administradores" },
  { key: "PROFESOR", label: "Profesores" },
  { key: "CLIENTE", label: "Clientes" },
];

export function UsuariosScreen({
  data,
  currentUserId,
}: {
  data: UsuariosData;
  currentUserId: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [vista, setVista] = useState<Vista>("cards");
  const queryRef = useRef(query);

  const updateQuery = useCallback((value: string) => {
    queryRef.current = value;
    setQuery(value);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.users.filter((user) => {
      if (q && !user.name.toLowerCase().includes(q) && !user.loginId?.toLowerCase().includes(q))
        return false;
      if (filter !== "all" && user.role !== filter) return false;
      return true;
    });
  }, [data.users, query, filter]);

  const pillCounts: Record<Filter, number> = {
    all: data.counts.total,
    ADMIN: data.counts.admins,
    PROFESOR: data.counts.profesores,
    CLIENTE: data.counts.clientes,
  };

  const hasActiveFilters = Boolean(query.trim()) || filter !== "all";

  function clearFilters() {
    setQuery("");
    setFilter("all");
  }

  function handleToggle(user: AdminUserRow) {
    startTransition(async () => {
      const result = await setUserActiveAction(user.id, !user.isActive);
      if (!result.ok) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleDelete(user: AdminUserRow) {
    if (
      !window.confirm(
        `¿Eliminar PERMANENTEMENTE la cuenta de ${user.name}? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }
    startTransition(async () => {
      const result = await deleteUserAction(user.id);
      if (!result.ok) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-6 pt-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Usuarios
          </p>
          <h1 className="text-2xl font-black uppercase leading-tight text-ink">
            {data.counts.total} cuentas
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/admin/usuarios/nuevo"
            className="flex min-h-9 items-center gap-1 rounded-full bg-brand px-3 text-[11px] font-extrabold uppercase tracking-wide text-brand-foreground transition-opacity active:opacity-80"
          >
            <Plus className="h-4 w-4" />
            Nuevo
          </Link>
          <div className="flex items-center rounded-full bg-surface-elevated p-1">
            <button
              type="button"
              title="Vista tarjetas"
              aria-label="Vista tarjetas"
              aria-pressed={vista === "cards"}
              onClick={() => setVista("cards")}
              className={`rounded-full p-2 transition-colors ${
                vista === "cards"
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
              aria-pressed={vista === "lista"}
              onClick={() => setVista("lista")}
              className={`rounded-full p-2 transition-colors ${
                vista === "lista"
                  ? "bg-brand text-brand-foreground"
                  : "text-ink-muted"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          type="text"
          value={query}
          onChange={(event) => updateQuery(event.target.value)}
          placeholder="Buscar por nombre o DNI…"
          aria-label="Buscar usuarios"
          className="min-h-12 w-full rounded-2xl border border-border bg-surface pl-11 pr-10 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-muted focus:border-brand/60"
        />
        {query ? (
          <button
            type="button"
            onClick={() => updateQuery("")}
            aria-label="Limpiar búsqueda"
            title="Limpiar búsqueda"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted transition-colors hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="flex flex-nowrap gap-1.5 overflow-x-auto lg:flex-wrap lg:overflow-x-visible">
        {ESTADO_PILLS.map((pill) => (
          <button
            key={pill.key}
            type="button"
            onClick={() => setFilter(pill.key)}
            className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-bold transition-colors ${
              filter === pill.key
                ? "bg-brand text-brand-foreground"
                : "bg-surface-elevated text-ink-muted"
            }`}
          >
            {pill.label} {pillCounts[pill.key]}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-ink-muted">
          Mostrando{" "}
          <span className="font-bold text-ink">{filtered.length}</span>{" "}
          de {data.counts.total}
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

      {filtered.length > 0 ? (
        <>
          {vista === "cards" ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              <AnimatePresence mode="popLayout" initial={false}>
                {filtered.map((user) => (
                  <motion.div
                    key={user.id}
                    layout
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25 }}
                    className="h-full"
                  >
                    <UserCard
                      user={user}
                      isSelf={user.id === currentUserId}
                      onToggle={() => handleToggle(user)}
                      onDelete={
                        user.id !== currentUserId
                          ? () => handleDelete(user)
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
                {filtered.map((user) => (
                  <motion.div
                    key={user.id}
                    layout
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.25 }}
                  >
                    <UserRow
                      user={user}
                      isSelf={user.id === currentUserId}
                      onToggle={() => handleToggle(user)}
                      onDelete={
                        user.id !== currentUserId
                          ? () => handleDelete(user)
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
        <div className="rounded-2xl border border-dashed border-border py-12 text-center">
          <p className="text-sm font-bold text-ink">
            {hasActiveFilters
              ? "No se encontraron usuarios."
              : "No hay usuarios."}
          </p>
          {hasActiveFilters && (
            <p className="mt-1 text-xs text-ink-muted">
              Probá ajustar la búsqueda o los filtros.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
