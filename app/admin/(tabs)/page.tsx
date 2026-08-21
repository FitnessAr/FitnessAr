import { requireAdmin } from "@/features/admin/require-admin";
import { HomeScreen } from "@/features/admin/home/home-screen";

export default async function AdminHomePage() {
  const admin = await requireAdmin();
  return <HomeScreen adminName={admin.name} />;
}
