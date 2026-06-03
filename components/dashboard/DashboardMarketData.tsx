"use client";

import { useEffect, useState } from "react";
import { AgentVisualPanel } from "@/components/agent/AgentVisualPanel";
import { ChatCommandBox } from "@/components/dashboard/ChatCommandBox";
import { TopDumpList } from "@/components/dashboard/TopDumpList";
import { TopPumpList } from "@/components/dashboard/TopPumpList";
import type { MarketApiResponse, NormalizedMarketData } from "@/lib/types/market";

type DataState = {
  loading: boolean;
  data: NormalizedMarketData[];
  error?: string;
};

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

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <TopPumpList coins={pumps.data} loading={pumps.loading} error={pumps.error} />
        <TopDumpList coins={dumps.data} loading={dumps.loading} error={dumps.error} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
        <ChatCommandBox />
        <AgentVisualPanel />
      </div>
    </>
  );
}
