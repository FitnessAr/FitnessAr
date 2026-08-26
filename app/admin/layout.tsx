import { AdminShell } from "@/components/admin-shell";
import type { BottomNavTab } from "@/components/bottom-nav";

const TABS: BottomNavTab[] = [
  { href: "/admin", label: "Inicio", icon: "home", exact: true },
  { href: "/admin/usuarios", label: "Usuarios", icon: "users" },
  { href: "/admin/ejercicios", label: "Ejercicios", icon: "dumbbell" },
  { href: "/admin/configuracion", label: "Configuración", icon: "settings" },
];

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <AdminShell tabs={TABS}>{children}</AdminShell>;
}
