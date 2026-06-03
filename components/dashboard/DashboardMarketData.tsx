"use client";

import { useEffect, useState } from "react";
import { AgentVisualPanel } from "@/components/agent/AgentVisualPanel";
import { ChatCommandBox } from "@/components/dashboard/ChatCommandBox";
import { TopDumpList } from "@/components/dashboard/TopDumpList";
import { TopPumpList } from "@/components/dashboard/TopPumpList";
import type { AnalyzeApiError, AnalyzeApiResponse, EngineAnalysis, MarketApiResponse, NormalizedMarketData } from "@/lib/types/market";

type DataState = {
  loading: boolean;
  data: NormalizedMarketData[];
  error?: string;
};

type AnalyzeStatus = "idle" | "fetching_market" | "running_engine" | "rendering";

async function fetchMarketList(endpoint: string): Promise<NormalizedMarketData[]> {
  const response = await fetch(endpoint, { cache: "no-store" });
  const payload = (await response.json()) as MarketApiResponse<NormalizedMarketData[]>;

  if (!response.ok || payload.status === "error") {
    throw new Error(payload.status === "error" ? payload.details ?? payload.message : "Failed to load market data");
  }

  return payload.data;
}

export function DashboardMarketData() {
  const [pumps, setPumps] = useState<DataState>({ loading: true, data: [] });
  const [dumps, setDumps] = useState<DataState>({ loading: true, data: [] });
  const [analysis, setAnalysis] = useState<EngineAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<AnalyzeApiError | null>(null);
  const [analyzeStatus, setAnalyzeStatus] = useState<AnalyzeStatus>("idle");

  useEffect(() => {
    let isMounted = true;

    fetchMarketList("/api/market/top-pump")
      .then((data) => {
        if (isMounted) setPumps({ loading: false, data });
      })
      .catch((error) => {
        if (isMounted) setPumps({ loading: false, data: [], error: error instanceof Error ? error.message : "Unknown pump data error" });
      });

    fetchMarketList("/api/market/top-dump")
      .then((data) => {
        if (isMounted) setDumps({ loading: false, data });
      })
      .catch((error) => {
        if (isMounted) setDumps({ loading: false, data: [], error: error instanceof Error ? error.message : "Unknown dump data error" });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  function handleAnalysis(response: AnalyzeApiResponse) {
    if (response.ok) {
      setAnalysis(response.analysis);
      setAnalysisError(null);
      return;
    }

    setAnalysis(null);
    setAnalysisError(response);
  }

  const loadingLabel = analyzeStatus === "idle" ? undefined : {
    fetching_market: "Fetching market data",
    running_engine: "Running Python AI Neuron Engine",
    rendering: "Rendering visual analysis"
  }[analyzeStatus];

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <TopPumpList coins={pumps.data} loading={pumps.loading} error={pumps.error} />
        <TopDumpList coins={dumps.data} loading={dumps.loading} error={dumps.error} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
        <ChatCommandBox onAnalysis={handleAnalysis} onStatusChange={setAnalyzeStatus} />
        <AgentVisualPanel analysis={analysis} error={analysisError} loadingLabel={loadingLabel} />
      </div>
    </>
  );
}
