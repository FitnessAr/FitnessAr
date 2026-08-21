"use client";

import { useState } from "react";
import type { Client } from "../roster";
import { ClientRow } from "./client-row";

export function ClientesScreen({ clients }: { clients: Client[] }) {
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? clients.filter((client) => client.name.toLowerCase().includes(normalizedQuery))
    : clients;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-6 pb-28 pt-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Clientes
        </p>
        <h1 className="text-3xl font-black uppercase leading-tight text-ink">
          {clients.length} registrados
        </h1>
      </div>

      <input
        type="text"
        placeholder="Buscar cliente..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="rounded-2xl border border-border bg-surface px-4 py-3.5 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none"
      />

      <div className="flex flex-col gap-3">
        {filtered.map((client) => (
          <ClientRow key={client.id} client={client} />
        ))}
        {filtered.length === 0 && clients.length === 0 && (
          <p className="py-6 text-center text-sm text-ink-muted">
            Todavía no tenés clientes asignados.
          </p>
        )}
        {filtered.length === 0 && clients.length > 0 && (
          <p className="py-6 text-center text-sm text-ink-muted">
            No se encontraron clientes.
          </p>
        )}
      </div>
    </div>
  );
}
