import { requireAdmin } from "@/features/admin/require-admin";
import { getDashboardData } from "@/features/admin/home/get-dashboard-data";
import { HomeScreen } from "@/features/admin/home/home-screen";

export default async function AdminHomePage() {
  const admin = await requireAdmin();
  const data = await getDashboardData(admin.branchId);
  return <HomeScreen adminName={admin.name} data={data} />;
}
