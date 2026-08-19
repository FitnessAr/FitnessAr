import { getPerfilData } from "@/features/profesor/perfil/get-perfil-data";
import { PerfilScreen } from "@/features/profesor/perfil/perfil-screen";

export default async function PerfilPage() {
  const data = await getPerfilData();
  return <PerfilScreen data={data} />;
}
