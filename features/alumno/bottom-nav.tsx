"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, TrendingUp, User } from "lucide-react";

const TABS = [
  { href: "/alumno", label: "Inicio", icon: Home },
  { href: "/alumno/rutina", label: "Rutina", icon: CalendarDays },
  { href: "/alumno/progreso", label: "Progreso", icon: TrendingUp },
  { href: "/alumno/perfil", label: "Perfil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-border bg-background">
      <div className="mx-auto flex w-full max-w-sm items-center justify-around px-2 py-2">
        {TABS.map((tab) => {
          const isActive =
            tab.href === "/alumno"
              ? pathname === tab.href
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold uppercase tracking-wide ${
                isActive ? "text-brand" : "text-ink-muted"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
              <span
                className={`h-1 w-1 rounded-full ${
                  isActive ? "bg-brand" : "bg-transparent"
                }`}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
