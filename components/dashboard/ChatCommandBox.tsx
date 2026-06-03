"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { AnalyzeApiResponse } from "@/lib/types/market";

type AnalyzeStatus = "idle" | "fetching_market" | "running_engine" | "rendering";

type ChatCommandBoxProps = {
  placeholder?: string;
  onAnalysis: (response: AnalyzeApiResponse) => void;
  onStatusChange?: (status: AnalyzeStatus) => void;
};

function parseSymbol(command: string): string | null {
  const cleaned = command
    .toUpperCase()
    .replace(/[?!.:,;]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const ignored = new Set([
    "CEK",
    "KOIN",
    "ANALISIS",
    "ANALISA",
    "LIHAT",
    "LONG",
    "SHORT",
    "ATAU",
    "DAN",
    "COIN",
    "TOKEN",
    "MARKET"
  ]);

  const candidates = cleaned.split(" ").filter((token) => /^[A-Z0-9]{2,15}$/.test(token) && !ignored.has(token));
  return candidates[0] ?? null;
}

export function ChatCommandBox({ placeholder = "contoh: cek koin ZEC", onAnalysis, onStatusChange }: ChatCommandBoxProps) {
  const [command, setCommand] = useState("");
  const [status, setStatus] = useState<AnalyzeStatus>("idle");
  const [parsedSymbol, setParsedSymbol] = useState<string | null>(null);

  function updateStatus(nextStatus: AnalyzeStatus) {
    setStatus(nextStatus);
    onStatusChange?.(nextStatus);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const symbol = parseSymbol(command);
    setParsedSymbol(symbol);

    if (!symbol) {
      onAnalysis({
        ok: false,
        reason: "invalid_symbol",
        message: "Tulis symbol koin yang jelas. Contoh: cek koin ZEC, analisis BTC, ETH long atau short?"
      });
      return;
    }

    try {
      updateStatus("fetching_market");
      await new Promise((resolve) => setTimeout(resolve, 120));
      updateStatus("running_engine");

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ symbol }),
        cache: "no-store"
      });

      const payload = (await response.json()) as AnalyzeApiResponse;
      updateStatus("rendering");
      onAnalysis(payload);
    } catch {
      onAnalysis({
        ok: false,
        reason: "python_engine_error",
        message: "Analyze request failed before rendering visual result"
      });
    } finally {
      setTimeout(() => updateStatus("idle"), 180);
    }
  }

  const statusText = {
    idle: "Ready",
    fetching_market: "Fetching market data",
    running_engine: "Running Python AI Neuron Engine",
    rendering: "Rendering visual analysis"
  }[status];

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-glow">
      <div className="mb-4">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Command Center</p>
        <h2 className="mt-1 text-xl font-semibold text-white">Chat command box</h2>
        <p className="mt-2 text-sm text-slate-400">
          Tulis command bebas seperti cek koin ZEC, analisis BTC, atau ETH long atau short.
        </p>
      </div>

      <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
        <input
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          placeholder={placeholder}
          className="min-h-12 flex-1 rounded-2xl border border-slate-800 bg-slate-900 px-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60"
        />
        <button
          type="submit"
          disabled={status !== "idle"}
          className="min-h-12 rounded-2xl bg-cyan-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Analyze
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>Status: <span className="text-slate-300">{statusText}</span></span>
        {parsedSymbol ? <span>Symbol: <span className="text-cyan-200">{parsedSymbol}</span></span> : null}
      </div>
    </section>
  );
}
