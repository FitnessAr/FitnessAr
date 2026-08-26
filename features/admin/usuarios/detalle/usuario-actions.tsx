"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { deleteUserAction } from "../actions";

export function UsuarioActions({
  userId,
  userName,
  isSelf,
}: {
  userId: string;
  userName: string;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [, startRefresh] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (
      !window.confirm(
        `¿Eliminar PERMANENTEMENTE la cuenta de ${userName}? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    setError(null);
    setIsDeleting(true);
    const result = await deleteUserAction(userId);
    setIsDeleting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    startRefresh(() => router.push("/admin/usuarios"));
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`grid gap-2 ${error ? "" : "sm:grid-cols-[1fr_1fr]"}`}
      >
        <Link
          href={`/admin/usuarios/${userId}/editar`}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-surface-elevated text-xs font-extrabold uppercase tracking-wide text-ink transition-opacity active:opacity-80"
        >
          <Pencil className="h-4 w-4" />
          Editar
        </Link>
        <button
          type="button"
          onClick={() => void handleDelete()}
          disabled={isDeleting || isSelf}
          aria-label={isSelf ? "No podés eliminar tu propia cuenta" : `Eliminar ${userName}`}
          title={isSelf ? "No podés eliminar tu propia cuenta" : undefined}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-danger/10 text-xs font-extrabold uppercase tracking-wide text-danger transition-opacity active:opacity-80 disabled:opacity-40"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          {isDeleting ? "Eliminando…" : "Eliminar"}
        </button>
      </div>
      {error && (
        <p className="rounded-xl bg-danger/10 px-3 py-2 text-xs font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
