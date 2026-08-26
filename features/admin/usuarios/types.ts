export type AdminUserRow = {
  id: string;
  name: string;
  loginId: string | null;
  role: "ADMIN" | "PROFESOR" | "CLIENTE";
  isActive: boolean;
  image: string | null;
  bio: string | null;
  schedule: string | null;
};

export type UsuariosData = {
  users: AdminUserRow[];
  counts: { total: number; admins: number; profesores: number; clientes: number };
};
