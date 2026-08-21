"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { UserRow } from "./user-row";
import type { UsuariosData } from "./types";

type Filter = "all" | "ADMIN" | "PROFESOR";

export function UsuariosScreen({
  data,
  currentUserId,
}: {
  data: UsuariosData;
  currentUserId: string;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = filter === "all" ? data.users : data.users.filter((user) => user.role === filter);

  const pills: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "Todos", count: data.counts.total },
    { key: "ADMIN", label: "Administradores", count: data.counts.admins },
    { key: "PROFESOR", label: "Profesores", count: data.counts.profesores },
  ];

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-6 pb-28 pt-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Usuarios
          </p>
          <h1 className="text-2xl font-black uppercase leading-tight text-ink">
            {data.counts.total} cuentas
          </h1>
        </div>
        <Link
          href="/admin/usuarios/nuevo"
          className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-2xl bg-brand px-3 text-xs font-extrabold uppercase tracking-wide text-brand-foreground transition-opacity active:opacity-80"
        >
          <Plus className="h-4 w-4" />
          Nuevo
        </Link>
      </div>

      <div className="flex flex-nowrap gap-1.5 overflow-x-auto">
        {pills.map((pill) => (
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
            {pill.label} {pill.count}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((user) => (
          <UserRow key={user.id} user={user} isSelf={user.id === currentUserId} />
        ))}
        {filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-ink-muted">
            No hay usuarios en este filtro.
          </p>
        )}
      </div>
    </div>
  );
}
