import { BottomNav, type BottomNavTab } from "@/components/bottom-nav";

const TABS: BottomNavTab[] = [
  { href: "/cliente", label: "Inicio", icon: "home", exact: true },
  { href: "/cliente/rutina", label: "Rutina", icon: "calendar" },
  { href: "/cliente/progreso", label: "Progreso", icon: "trending" },
  { href: "/cliente/perfil", label: "Perfil", icon: "user" },
];

export default function ClienteLayout({ children }: LayoutProps<"/cliente">) {
  return (
    <div className="min-h-dvh bg-background">
      {children}
      <BottomNav tabs={TABS} />
    </div>
  );
}
