import { BottomNav } from "@/features/alumno/bottom-nav";

export default function AlumnoLayout({ children }: LayoutProps<"/alumno">) {
  return (
    <div className="min-h-dvh bg-background">
      {children}
      <BottomNav />
    </div>
  );
}
