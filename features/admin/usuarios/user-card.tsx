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

export function UserCard({
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
    <div
      className={`flex h-full flex-col overflow-hidden rounded-2xl border bg-surface transition-colors ${
        user.isActive ? "border-border" : "border-danger/30"
      }`}
    >
      <Link
        href={`/admin/usuarios/${user.id}`}
        aria-label={`Ver ${user.name}`}
        className="relative block aspect-square w-full overflow-hidden bg-surface-elevated"
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
            className={`flex h-full w-full items-center justify-center text-2xl font-bold ${getAvatarColorClassName(
              user.name
            )}`}
          >
            {getInitials(user.name)}
          </span>
        )}
        {!user.isActive && (
          <span className="absolute left-2 top-2 flex h-6 items-center rounded-full bg-danger/80 px-2 text-[10px] font-bold uppercase text-white">
            Inactivo
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <Link
          href={`/admin/usuarios/${user.id}`}
          className="line-clamp-2 min-h-[2.4rem] text-sm font-bold leading-tight text-ink"
        >
          {user.name}
          {isSelf && (
            <span className="ml-1.5 text-xs font-semibold text-ink-muted">(Vos)</span>
          )}
        </Link>
        <span
          className={`shrink-0 self-start rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            user.role === "ADMIN"
              ? "bg-brand/15 text-brand"
              : "bg-surface-elevated text-ink-muted"
          }`}
        >
          {ROLE_LABELS[user.role]}
        </span>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
          <Link
            href={`/admin/usuarios/${user.id}`}
            aria-label={`Ver ${user.name}`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-elevated text-ink-muted transition-colors hover:text-ink"
          >
            <Pencil className="h-4 w-4" />
          </Link>

          <div className="flex items-center gap-2">
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
                className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-elevated text-ink-muted transition-colors hover:text-danger disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
