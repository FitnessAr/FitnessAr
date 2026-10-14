import { requireAdmin } from "@/features/admin/require-admin";
import { getUsuariosData } from "@/features/admin/usuarios/get-usuarios-data";
import { UsuariosScreen } from "@/features/admin/usuarios/usuarios-screen";

export default async function UsuariosPage() {
  const admin = await requireAdmin();
  const data = await getUsuariosData();
  return <UsuariosScreen data={data} currentUserId={admin.id} />;
}
