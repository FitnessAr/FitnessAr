import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/features/admin/require-admin";
import { getUserForEdit } from "@/features/admin/usuarios/get-usuarios-data";
import { UsuarioDetalleScreen } from "@/features/admin/usuarios/detalle/usuario-detalle-screen";
import { UsuarioActions } from "@/features/admin/usuarios/detalle/usuario-actions";

export default async function UsuarioDetallePage({
  params,
}: PageProps<"/admin/usuarios/[id]">) {
  const admin = await requireAdmin();
  const { id } = await params;

  const user = await getUserForEdit(id);
  if (!user) notFound();

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-5 px-6 pt-8 md:max-w-2xl lg:max-w-4xl">
      <Link
        href="/admin/usuarios"
        aria-label="Volver a usuarios"
        className="flex min-h-11 w-fit items-center gap-1.5 rounded-2xl bg-surface-elevated px-3 text-xs font-extrabold uppercase tracking-wide text-ink-muted transition-opacity active:opacity-80"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>

      <UsuarioActions
        userId={user.id}
        userName={user.name}
        isSelf={user.id === admin.id}
      />
      <UsuarioDetalleScreen user={user} isSelf={user.id === admin.id} />
    </div>
  );
}
