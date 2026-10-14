import { requireAdmin } from "@/features/admin/require-admin";
import { NuevaCuentaScreen } from "@/features/admin/usuarios/nueva-cuenta-screen";

export default async function NuevaCuentaPage() {
  await requireAdmin();
  return <NuevaCuentaScreen />;
}
