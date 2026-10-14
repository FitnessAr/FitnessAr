import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/features/admin/require-admin";
import { getUserForEdit } from "@/features/admin/usuarios/get-usuarios-data";
import { EditarUsuarioScreen } from "@/features/admin/usuarios/editar-usuario-screen";

export default async function EditarUsuarioPage({
  params,
}: PageProps<"/admin/usuarios/[id]/editar">) {
  await requireAdmin();
  const { id } = await params;

  const user = await getUserForEdit(id);
  if (!user) notFound();

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-5 px-6 pt-8 lg:max-w-2xl">
      <Link
        href={`/admin/usuarios/${user.id}`}
        aria-label="Volver"
        className="flex min-h-11 w-fit items-center gap-1.5 rounded-2xl bg-surface-elevated px-3 text-xs font-extrabold uppercase tracking-wide text-ink-muted transition-opacity active:opacity-80"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>
      <EditarUsuarioScreen user={user} />
    </div>
  );
}
