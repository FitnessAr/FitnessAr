"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Client } from "../roster";
import type { UnassignedClient } from "./get-unassigned-clients";
import { ClientRow } from "./client-row";
import { UnassignedClientRow } from "./unassigned-client-row";
import { claimClientAction } from "./actions";

export function ClientesScreen({
  clients,
  unassignedClients,
}: {
  clients: Client[];
  unassignedClients: UnassignedClient[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? clients.filter((client) => client.name.toLowerCase().includes(normalizedQuery))
    : clients;

  const branchMatches = normalizedQuery
    ? unassignedClients.filter(
        (client) =>
          client.name.toLowerCase().includes(normalizedQuery) ||
          client.loginId?.toLowerCase().includes(normalizedQuery)
      )
    : [];

  function handleClaim(clienteId: string) {
    startTransition(async () => {
      const result = await claimClientAction(clienteId);
      if (!result.ok) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  }

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
        placeholder="Buscar por nombre o DNI..."
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

      {branchMatches.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Sin profesor en tu sucursal
          </p>
          {branchMatches.map((client) => (
            <UnassignedClientRow
              key={client.id}
              client={client}
              disabled={isPending}
              onClaim={() => handleClaim(client.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
