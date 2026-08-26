"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { getInitials } from "@/lib/get-initials";
import { getAvatarColorClassName } from "@/features/profesor/avatar-color";
import { ToggleSwitch } from "@/features/admin/catalogo/toggle-switch";
import type { AdminUserRow } from "./types";

const ROLE_LABELS: Record<AdminUserRow["role"], string> = {
  ADMIN: "Administrador",
  PROFESOR: "Profesor",
  CLIENTE: "Cliente",
};

export function UserRow({
  user,
  isSelf,
  onToggle,
  onDelete,
}: {
  user: AdminUserRow;
  isSelf: boolean;
  onToggle: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-2.5">
      <Link
        href={`/admin/usuarios/${user.id}`}
        aria-label={`Ver ${user.name}`}
        className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-elevated"
      >
        {user.image ? (
          <img
            src={user.image}
            alt={user.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className={`flex h-full w-full items-center justify-center text-sm font-bold ${getAvatarColorClassName(
              user.name
            )}`}
          >
            {getInitials(user.name)}
          </span>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={`/admin/usuarios/${user.id}`}
          className="block truncate text-sm font-bold text-ink"
        >
          {user.name}
          {isSelf && (
            <span className="ml-1.5 text-xs font-semibold text-ink-muted">(Vos)</span>
          )}
        </Link>
        <p className="truncate text-xs text-ink-muted">
          {ROLE_LABELS[user.role]}
          {user.isActive ? "" : " · Inactivo"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={`/admin/usuarios/${user.id}`}
          aria-label={`Ver ${user.name}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-ink-muted transition-colors hover:text-ink"
        >
          <Pencil className="h-4 w-4" />
        </Link>
        <ToggleSwitch
          checked={user.isActive}
          onChange={onToggle}
          disabled={isSelf}
          ariaLabel={
            isSelf
              ? "No podés desactivar tu propia cuenta"
              : user.isActive
                ? `Desactivar ${user.name}`
                : `Activar ${user.name}`
          }
          title={isSelf ? "No podés desactivar tu propia cuenta" : undefined}
        />
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isSelf}
            aria-label={isSelf ? "No podés eliminar tu propia cuenta" : `Eliminar ${user.name}`}
            title={isSelf ? "No podés eliminar tu propia cuenta" : undefined}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-ink-muted transition-colors hover:text-danger disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
