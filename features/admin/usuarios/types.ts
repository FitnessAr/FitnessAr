export type AdminUserRow = {
  id: string;
  name: string;
  loginId: string | null;
  role: "ADMIN" | "PROFESOR";
  isActive: boolean;
};

export type UsuariosData = {
  users: AdminUserRow[];
  counts: { total: number; admins: number; profesores: number };
};
