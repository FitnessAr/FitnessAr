"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, CalendarDays, ClipboardList, Home, TrendingUp, User, Users } from "lucide-react";

// Los componentes de ícono (funciones) no se pueden pasar como prop de un Server Component a este
// Client Component — por eso `BottomNavTab.icon` es un nombre (string, serializable) y el mapeo a
// componente real se resuelve acá adentro.
const ICONS = {
  home: Home,
  calendar: CalendarDays,
  trending: TrendingUp,
  user: User,
  users: Users,
  clipboard: ClipboardList,
  activity: Activity,
} as const;

export type BottomNavIconName = keyof typeof ICONS;

export type BottomNavTab = {
  href: string;
  label: string;
  icon: BottomNavIconName;
  // true para la pestaña de inicio: su href es prefijo de todas las demás, así que necesita
  // match exacto en vez de "empieza con" para no quedar marcada activa en cualquier sub-ruta.
  exact?: boolean;
};

export function BottomNav({ tabs }: { tabs: BottomNavTab[] }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-border bg-background">
      <div className="mx-auto flex w-full max-w-sm items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = ICONS[tab.icon];
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold uppercase tracking-wide ${
                isActive ? "text-brand" : "text-ink-muted"
              }`}
            >
              <Icon className="h-5 w-5" />
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
