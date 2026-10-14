export type UsuarioTabData = {
  admin: { name: string; loginId: string | null };
  profesoresActivos: { id: string; name: string; schedule: string | null }[];
  horaActualAR: string;
};
