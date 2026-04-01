import { DEFAULT_SCAN_QUERY } from "@/lib/constants";
import { productConfig } from "@/lib/config/product";
import { getDemoLeadCatalog } from "@/lib/demo/data";
import { createScanRun, getDashboardStats, getRecentScanRuns, getSavedLeads, upsertLeads } from "@/lib/db";
import { runLeadScan } from "@/lib/sources";
import type { Lead, ScanQuery, ScanResponse } from "@/types/lead";

function mergeSavedState(scanLeads: Lead[], savedLeads: Lead[]) {
  const savedMap = new Map(savedLeads.map((lead) => [lead.id, lead]));
  return scanLeads.map((lead) => {
    const persisted = savedMap.get(lead.id);
    if (!persisted) return lead;
    return {
      ...lead,
      saved: persisted.saved,
      hidden: persisted.hidden,
      tags: persisted.tags,
      notes: persisted.notes,
      created_at: persisted.created_at,
      updated_at: persisted.updated_at,
    };
  });
}

export async function getInitialDashboardData() {
  const savedLeads = getSavedLeads();
  const previewLeads = mergeSavedState(
    getDemoLeadCatalog()
      .filter(
        (lead) =>
          lead.niche === DEFAULT_SCAN_QUERY.niche &&
          lead.city === DEFAULT_SCAN_QUERY.city &&
          lead.state === DEFAULT_SCAN_QUERY.state,
      )
      .sort((a, b) => b.lead_score - a.lead_score),
    savedLeads,
  );

  upsertLeads(previewLeads);

  return {
    defaultQuery: productConfig.defaultScan,
    initialLeads: previewLeads,
    savedLeads,
    recentScans: getRecentScanRuns(),
    stats: getDashboardStats(),
  };
}

export async function executeScan(query: ScanQuery): Promise<ScanResponse> {
  const result = await runLeadScan(query);
  upsertLeads(result.leads);
  const savedLeads = getSavedLeads();
  const mergedLeads = mergeSavedState(result.leads, savedLeads).sort((a, b) => b.lead_score - a.lead_score);
  const scan = createScanRun(
    query,
    result.adapter,
    mergedLeads.length,
    result.mode,
    result.warning ?? `${mergedLeads.length} leads ready for review.`,
  );

  return {
    leads: mergedLeads,
    scan,
    warning: result.warning,
  };
}
