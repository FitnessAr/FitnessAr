// Tipos compartidos de la vista Catálogo (features/admin/catalogo).
// El catálogo completo viene de la API externa (proyecto hermano exercise-catalog) y viaja
// entero al cliente en la carga inicial: el filtrado y la paginación se resuelven en memoria.
// Los incluidos se persisten localmente en la tabla Exercise.

// Ejercicio tal como lo consume la UI. gifUrl ya viene como URL absoluta lista para <img>
// (la API devuelve paths relativos tipo "videos/0001-xxx.gif", se resuelven contra
// CATALOG_API_URL en el server — ver catalog-api.ts).
export type CatalogExercise = {
  id: string;
  name: string;
  category: string | null;
  bodyPart: string | null;
  equipment: string | null;
  muscleGroup: string | null;
  target: string | null;
  gifUrl: string | null;
};

export type CatalogFilterOption = { value: string; count: number };

// Espejo de GET /api/exercises/meta (claves snake_case igual que los query params).
export type CatalogMeta = {
  category: CatalogFilterOption[];
  body_part: CatalogFilterOption[];
  equipment: CatalogFilterOption[];
  muscle_group: CatalogFilterOption[];
  target: CatalogFilterOption[];
};

// Filtros activos. Se parsean de searchParams como estado inicial en la página; después viven
// en el cliente (la URL se mantiene sincronizada vía history.replaceState shallow routing).
export type CatalogoFilters = {
  q: string;
  category: string;
  equipment: string;
  target: string;
  estado: CatalogoEstado;
  vista: CatalogoVista;
  page: number;
};

export type CatalogoEstado = "todos" | "incluidos" | "excluidos";
export type CatalogoVista = "cards" | "lista";

export type CatalogoData = {
  // TODOS los ejercicios del catálogo global (sin filtrar ni paginar server-side).
  exercises: CatalogExercise[];
  meta: CatalogMeta;
  // Total global del catálogo (alimenta las pills Todos/Incluidos/No incluidos; los conteos
  // por estado se calculan en el cliente sobre includedIds + cambios pendientes).
  counts: { total: number };
  // Ids presentes en la tabla Exercise local (serializable: el Set se arma en el cliente).
  includedIds: string[];
};
