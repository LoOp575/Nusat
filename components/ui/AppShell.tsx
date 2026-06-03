import { Header } from "@/components/ui/Header";
import { Sidebar } from "@/components/ui/Sidebar";

type AppShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function AppShell({ title, subtitle, children }: AppShellProps) {
  return (
    <div className="dashboard-grid flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Header title={title} subtitle={subtitle} />
        <main className="px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
