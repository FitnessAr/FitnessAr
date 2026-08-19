import { getAlumnoPerfilData } from "@/features/alumno/perfil/get-perfil-data";
import { PerfilScreen } from "@/features/alumno/perfil/perfil-screen";

export default async function PerfilPage() {
  const data = await getAlumnoPerfilData();
  return <PerfilScreen data={data} />;
}
