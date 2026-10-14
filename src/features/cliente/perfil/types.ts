export type ClientePerfilData =
  | { hasProfessor: false; clientName: string }
  | {
      hasProfessor: true;
      clientName: string;
      assignedBy: string;
      routineName: string;
      memberSinceLabel: string;
      nextTrainingDayLabel: string;
    };
