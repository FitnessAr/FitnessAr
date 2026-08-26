"use client";

import { SideNav } from "./side-nav";
import { BottomNav, type BottomNavTab } from "./bottom-nav";

export function AdminShell({
  tabs,
  children,
}: {
  tabs: BottomNavTab[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background">
      <SideNav tabs={tabs} />
      <div className="lg:hidden">
        <BottomNav tabs={tabs} />
      </div>
      <main className="pb-28 lg:pb-0">{children}</main>
    </div>
  );
}
