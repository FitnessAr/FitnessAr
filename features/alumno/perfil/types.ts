export type AlumnoPerfilData =
  | { hasProfessor: false; studentName: string }
  | {
      hasProfessor: true;
      studentName: string;
      assignedBy: string;
      routineName: string;
      memberSinceLabel: string;
      nextTrainingDayLabel: string;
    };
