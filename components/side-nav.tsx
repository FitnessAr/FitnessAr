"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  CalendarDays,
  ClipboardList,
  Dumbbell,
  Home,
  Settings,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import type { BottomNavTab } from "./bottom-nav";

const ICONS = {
  home: Home,
  calendar: CalendarDays,
  trending: TrendingUp,
  user: User,
  users: Users,
  clipboard: ClipboardList,
  activity: Activity,
  dumbbell: Dumbbell,
  settings: Settings,
} as const;

export function SideNav({ tabs }: { tabs: BottomNavTab[] }) {
  const pathname = usePathname();

  return (
    <nav className="group fixed inset-y-0 left-0 z-50 hidden w-16 flex-col border-r border-border bg-surface transition-[width] duration-200 hover:w-60 lg:flex">
      <div className="flex h-14 shrink-0 items-center justify-center gap-2 overflow-hidden border-b border-border px-4 group-hover:justify-start">
        <Dumbbell className="h-6 w-6 shrink-0 text-brand" />
        <span className="hidden whitespace-nowrap text-sm font-black uppercase tracking-wide text-ink group-hover:inline">
          FitnessAr
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-2">
        {tabs.map((tab) => {
          const Icon = ICONS[tab.icon];
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              title={tab.label}
              className={`flex items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-brand/10 text-brand"
                  : "text-ink-muted hover:bg-surface-elevated hover:text-ink"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="whitespace-nowrap hidden group-hover:inline">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
