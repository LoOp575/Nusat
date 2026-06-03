type HeaderProps = {
  title: string;
  subtitle?: string;
};

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 px-4 py-4 backdrop-blur md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Vision Market Agent</p>
          <h1 className="mt-1 text-2xl font-semibold text-white">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
        </div>
        <div className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-400">
          Mock mode · No API keys
        </div>
      </div>
    </header>
  );
}
