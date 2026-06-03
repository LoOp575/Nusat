import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/coin/ZEC", label: "Coin demo" },
  { href: "/settings", label: "Settings" }
];

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-slate-800 bg-slate-950/80 p-5 lg:block">
      <Link href="/dashboard" className="block rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Vision</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Market Agent</h1>
        <p className="mt-2 text-sm text-slate-400">Neuron crypto dashboard skeleton</p>
      </Link>

      <nav className="mt-8 space-y-2">
        {navItems.map((item) => (
          <Link
            href={item.href}
            key={item.href}
            className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-slate-900 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-400">
        <p className="font-semibold text-slate-200">MVP Stage 1</p>
        <p className="mt-2 leading-6">Setup, folder structure, UI skeleton, mock data. No API integration yet.</p>
      </div>
    </aside>
  );
}
