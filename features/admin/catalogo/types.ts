// Tipos compartidos de la vista Catálogo (features/admin/catalogo).
// Los datos crudos vienen de la API externa del catálogo global (proyecto hermano
// exercise-catalog); los incluidos se persisten localmente en la tabla Exercise.

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

// Filtros activos, parseados de searchParams en la página y reenviados acá.
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
  exercises: CatalogExercise[];
  meta: CatalogMeta;
  // Totales GLOBALES del catálogo (independientes de los filtros activos): alimentan las pills
  // Todos/Incluidos/No incluidos, que siempre muestran el tamaño real de cada grupo.
  counts: { total: number; incluidos: number };
  // Total de resultados para la búsqueda/filtros activos, SIN el filtro de estado.
  filteredTotal: number;
  // Total CON el filtro de estado aplicado. null = se cortó el conteo por paginación
  // (todavía hay más resultados que no se recorrieron).
  matchedTotal: number | null;
  hasMore: boolean;
  // Ids presentes en la tabla Exercise local (serializable: el Set se arma en el cliente).
  includedIds: string[];
};
