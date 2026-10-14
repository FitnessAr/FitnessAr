import { requireAdmin } from "@/features/admin/require-admin";
import { getUsuarioTabData } from "@/features/admin/configuracion/get-usuario-tab-data";
import { getAdminRoutinesData } from "@/features/admin/rutinas/get-admin-routines-data";
import { ConfiguracionScreen } from "@/features/admin/configuracion/configuracion-screen";

export default async function ConfiguracionPage() {
  const admin = await requireAdmin();

  const [usuarioData, rutinasData] = await Promise.all([
    getUsuarioTabData(admin),
    getAdminRoutinesData(admin.branchId),
  ]);

  return <ConfiguracionScreen usuarioData={usuarioData} rutinasData={rutinasData} />;
}
