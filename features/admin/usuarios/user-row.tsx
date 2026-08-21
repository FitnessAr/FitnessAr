"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { getInitials } from "@/lib/get-initials";
import { getAvatarColorClassName } from "@/features/profesor/avatar-color";
import { setUserActiveAction, deleteUserAction } from "./actions";
import type { AdminUserRow } from "./types";

const ROLE_LABELS: Record<AdminUserRow["role"], string> = {
  ADMIN: "Administrador",
  PROFESOR: "Profesor",
};

export function UserRow({ user, isSelf }: { user: AdminUserRow; isSelf: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const result = await setUserActiveAction(user.id, !user.isActive);
      if (!result.ok) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  function remove() {
    const confirmed = window.confirm(
      `¿Eliminar PERMANENTEMENTE la cuenta de ${user.name}? Esto borra la cuenta de la base de ` +
        `datos y no se puede deshacer. Si preferís poder reactivarla después, usá el interruptor ` +
        `de "Activo" en vez de esto.`
    );
    if (!confirmed) return;

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
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${getAvatarColorClassName(
            user.name
          )}`}
        >
          {getInitials(user.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink">
            {user.name}
            {isSelf && <span className="ml-1.5 text-xs font-semibold text-ink-muted">(Vos)</span>}
          </p>
          <p className="truncate text-xs text-ink-muted">{user.loginId}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
            user.role === "ADMIN" ? "bg-brand/15 text-brand" : "bg-surface-elevated text-ink-muted"
          }`}
        >
          {ROLE_LABELS[user.role]}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span
          className={`flex items-center gap-1.5 text-xs font-semibold ${
            user.isActive ? "text-brand" : "text-danger"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? "bg-brand" : "bg-danger"}`} />
          {user.isActive ? "Activo" : "Inactivo"}
        </span>

        <div className="flex items-center gap-3">
          <Link
            href={`/admin/usuarios/${user.id}/editar`}
            aria-label={`Cambiar contraseña de ${user.name}`}
            className="text-ink-muted"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            role="switch"
            aria-checked={user.isActive}
            aria-label={
              isSelf
                ? "No podés desactivar tu propia cuenta"
                : user.isActive
                  ? "Desactivar cuenta"
                  : "Activar cuenta"
            }
            title={isSelf ? "No podés desactivar tu propia cuenta" : undefined}
            onClick={toggle}
            disabled={isPending || isSelf}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-40 ${
              user.isActive ? "bg-brand" : "bg-surface-elevated"
            }`}
          >
            <span
              className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-background transition-transform ${
                user.isActive ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={isPending || isSelf}
            aria-label={isSelf ? "No podés eliminar tu propia cuenta" : "Eliminar cuenta"}
            title={isSelf ? "No podés eliminar tu propia cuenta" : undefined}
            className="text-danger disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
