import { DashboardMarketData } from "@/components/dashboard/DashboardMarketData";
import { AppShell } from "@/components/ui/AppShell";

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard" subtitle="Market lists loaded from server routes.">
      <DashboardMarketData />
    </AppShell>
  );
}
