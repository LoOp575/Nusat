import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";

export default function HomePage() {
  return (
    <AppShell title="Home" subtitle="MVP skeleton for AI crypto market analysis.">
      <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-8 shadow-glow">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Stage 1</p>
        <h2 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-white md:text-5xl">
          Dark dashboard skeleton for the future neuron math market agent.
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
          Tahap ini fokus ke setup project, struktur folder, layout dasar, mock data, dan UI yang rapi. Engine analisis, API market, dan AI agent asli sengaja belum dipasang supaya tidak bentrok.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300">
            Open dashboard
          </Link>
          <Link href="/settings" className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 hover:border-cyan-400/50">
            View settings
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
