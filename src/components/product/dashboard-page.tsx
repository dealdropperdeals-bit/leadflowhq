import { SharedDashboardShell } from "@/components/shared/scanner/dashboard-shell";
import { productConfig } from "@/lib/config/product";
import { getInitialDashboardData } from "@/lib/server";

export async function ProductDashboardPage() {
  const data = await getInitialDashboardData();
  return <SharedDashboardShell config={productConfig} {...data} />;
}
