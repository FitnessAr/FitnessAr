import { BottomNav, type BottomNavTab } from "@/components/bottom-nav";

const TABS: BottomNavTab[] = [
  { href: "/profesor", label: "Inicio", icon: "home", exact: true },
  { href: "/profesor/alumnos", label: "Alumnos", icon: "users" },
  { href: "/profesor/rutinas", label: "Rutinas", icon: "clipboard" },
  { href: "/profesor/perfil", label: "Perfil", icon: "user" },
];

export default function ProfesorLayout({ children }: LayoutProps<"/profesor">) {
  return (
    <div className="min-h-dvh bg-background">
      {children}
      <BottomNav tabs={TABS} />
    </div>
  );
}
