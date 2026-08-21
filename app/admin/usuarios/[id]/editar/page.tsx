import { notFound } from "next/navigation";
import { requireAdmin } from "@/features/admin/require-admin";
import { getUserForEdit } from "@/features/admin/usuarios/get-usuarios-data";
import { EditarCuentaScreen } from "@/features/admin/usuarios/editar-cuenta-screen";

export default async function EditarCuentaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const user = await getUserForEdit(id);
  if (!user) notFound();

  return <EditarCuentaScreen user={user} />;
}
