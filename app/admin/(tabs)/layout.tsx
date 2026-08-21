import { BottomNav, type BottomNavTab } from "@/components/bottom-nav";

const TABS: BottomNavTab[] = [
  { href: "/admin", label: "Inicio", icon: "home", exact: true },
  { href: "/admin/usuarios", label: "Usuarios", icon: "users" },
  { href: "/admin/ejercicios", label: "Ejercicios", icon: "dumbbell" },
  { href: "/admin/configuracion", label: "Configuración", icon: "settings" },
];

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-dvh bg-background">
      {children}
      <BottomNav tabs={TABS} />
    </div>
  );
}
