import { requireProfesor } from "@/features/profesor/require-profesor";
import { getPerfilData } from "@/features/profesor/perfil/get-perfil-data";
import { PerfilScreen } from "@/features/profesor/perfil/perfil-screen";

export default async function PerfilPage() {
  const { user, profesor } = await requireProfesor();
  const data = await getPerfilData(user, profesor);
  return <PerfilScreen data={data} />;
}
