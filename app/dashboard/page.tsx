import { AgentVisualPanel } from "@/components/agent/AgentVisualPanel";
import { ChatCommandBox } from "@/components/dashboard/ChatCommandBox";
import { TopDumpList } from "@/components/dashboard/TopDumpList";
import { TopPumpList } from "@/components/dashboard/TopPumpList";
import { AppShell } from "@/components/ui/AppShell";
import { topDumpCoins, topPumpCoins } from "@/lib/services/mock-market-data";

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard" subtitle="Top pump, top dump, and command skeleton with mock data.">
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <TopPumpList coins={topPumpCoins} />
        <TopDumpList coins={topDumpCoins} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
        <ChatCommandBox />
        <AgentVisualPanel />
      </div>
    </AppShell>
  );
}
