"use client";

import { useState } from "react";

type ChatCommandBoxProps = {
  placeholder?: string;
};

export function ChatCommandBox({ placeholder = "contoh: cek koin ZEC" }: ChatCommandBoxProps) {
  const [command, setCommand] = useState("");

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-glow">
      <div className="mb-4">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Command Center</p>
        <h2 className="mt-1 text-xl font-semibold text-white">Chat command box</h2>
        <p className="mt-2 text-sm text-slate-400">
          Tahap ini masih mock. Nanti command akan diproses server-side ke AI neuron math engine.
        </p>
      </div>

      <form className="flex flex-col gap-3 sm:flex-row" onSubmit={(event) => event.preventDefault()}>
        <input
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          placeholder={placeholder}
          className="min-h-12 flex-1 rounded-2xl border border-slate-800 bg-slate-900 px-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60"
        />
        <button
          type="submit"
          className="min-h-12 rounded-2xl bg-cyan-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Analyze mock
        </button>
      </form>

      {command ? (
        <p className="mt-3 text-xs text-slate-500">Draft command: <span className="text-slate-300">{command}</span></p>
      ) : null}
    </section>
  );
}
