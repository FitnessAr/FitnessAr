import { BottomNav, type BottomNavTab } from "@/components/bottom-nav";

const TABS: BottomNavTab[] = [
  { href: "/alumno", label: "Inicio", icon: "home", exact: true },
  { href: "/alumno/rutina", label: "Rutina", icon: "calendar" },
  { href: "/alumno/progreso", label: "Progreso", icon: "trending" },
  { href: "/alumno/perfil", label: "Perfil", icon: "user" },
];

export default function AlumnoLayout({ children }: LayoutProps<"/alumno">) {
  return (
    <div className="min-h-dvh bg-background">
      {children}
      <BottomNav tabs={TABS} />
    </div>
  );
}
