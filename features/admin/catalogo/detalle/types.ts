// Tipos de la ficha de ejercicio (features/admin/catalogo/detalle).
// La ficha se alimenta primero del snapshot local (tabla Exercise, escrito por
// toggleExerciseAction al incluir) y solo cae a la API del catálogo global cuando el
// ejercicio no está incluido (preview del admin). Por eso los campos son los mismos que
// persiste actions.toSnapshot, con la media ya resuelta a URL absoluta para <img>.

export type EjercicioDetalle = {
  id: string;
  name: string;
  category: string | null;
  bodyPart: string | null;
  equipment: string | null;
  muscleGroup: string | null;
  target: string | null;
  // Columnas Json en la DB (arrays de strings según la fuente); normalizadas defensivamente.
  secondaryMuscles: string[];
  instructionSteps: string[];
  imageUrl: string | null;
  gifUrl: string | null;
  attribution: string | null;
};

// De dónde salió lo que se muestra: "local" = fila Exercise de la sucursal;
// "api" = preview directo del catálogo global (ejercicio aún no incluido).
export type EjercicioDetalleData = {
  detalle: EjercicioDetalle;
  isIncluded: boolean;
};
