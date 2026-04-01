import { DemoLeadAdapter } from "@/lib/sources/demo-adapter";
import { OverpassLeadAdapter } from "@/lib/sources/overpass-adapter";
import type { SourceResult } from "@/lib/sources/types";
import type { ScanQuery } from "@/types/lead";

const demoAdapter = new DemoLeadAdapter();
const overpassAdapter = new OverpassLeadAdapter();

export async function runLeadScan(query: ScanQuery): Promise<SourceResult> {
  if (query.demoMode) {
    return demoAdapter.scan(query);
  }

  const liveResult = await overpassAdapter.scan(query);
  if (liveResult.leads.length > 0 && liveResult.mode === "live") {
    return liveResult;
  }

  const demoResult = await demoAdapter.scan(query);
  return {
    ...demoResult,
    mode: "fallback",
    warning: liveResult.warning ?? "Live mode failed, so the scan fell back to seeded demo data.",
  };
}
