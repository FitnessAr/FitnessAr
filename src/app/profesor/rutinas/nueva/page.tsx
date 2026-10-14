import { requireProfesor } from "@/features/profesor/require-profesor";
import { getClientRoster } from "@/features/profesor/roster";
import { getBranchExercises } from "@/features/routines/get-branch-exercises";
import { NuevaRutinaScreen } from "@/features/profesor/rutinas/nueva/nueva-rutina-screen";

export default async function NuevaRutinaPage() {
  const { user, profesor } = await requireProfesor();
  const [roster, branchExercises] = await Promise.all([
    getClientRoster(profesor.id),
    getBranchExercises(user.branchId),
  ]);
  return <NuevaRutinaScreen roster={roster} branchExercises={branchExercises} />;
}
