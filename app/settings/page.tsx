import { AppShell } from "@/components/ui/AppShell";
import { agentConfig } from "@/lib/agent/agent-config";

export default function SettingsPage() {
  return (
    <AppShell title="Settings" subtitle="Configuration skeleton for future API keys and agent modules.">
      <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-glow">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Mock config</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">{agentConfig.name}</h2>
        <p className="mt-2 text-sm text-slate-400">
          Belum ada input API key di frontend. Nanti semua key harus disimpan server-side via environment variables.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {agentConfig.modules.map((module) => (
            <div key={module} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="text-sm font-semibold text-slate-100">{module}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">Reserved module slot for next development stage.</p>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
