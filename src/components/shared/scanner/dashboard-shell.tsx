"use client";

import Link from "next/link";
import { Download, PanelRightOpen, RefreshCw, Sparkles } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import { trackEvent } from "@/lib/analytics";
import type { ProductConfig } from "@/lib/config/types";
import { cn } from "@/lib/utils";
import type { Lead, LeadFilters, ScanQuery, ScanRun } from "@/types/lead";

import { LeadDrawer } from "./lead-drawer";
import { ResultsTable } from "./results-table";
import { ScanControls } from "./scan-controls";
import { SummaryCards } from "./summary-cards";
import { UpgradeModal } from "./upgrade-modal";

type SharedDashboardShellProps = {
  config: ProductConfig;
  defaultQuery: ScanQuery;
  initialLeads: Lead[];
  savedLeads: Lead[];
  recentScans: ScanRun[];
  stats: {
    totalStored: number;
    savedLeads: number;
    highPriority: number;
    websiteIssues: number;
    contactable: number;
  };
};

async function patchEntity(entityId: string, payload: { saved?: boolean; hidden?: boolean; tags?: string[]; notes?: string }) {
  const response = await fetch(`/api/leads/${entityId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Unable to update entity");
  }

  return (await response.json()) as Lead;
}

export function SharedDashboardShell({
  config,
  defaultQuery,
  initialLeads,
  savedLeads: initialSaved,
  recentScans: initialRecentScans,
  stats,
}: SharedDashboardShellProps) {
  const [query, setQuery] = useState<ScanQuery>(defaultQuery);
  const [filters, setFilters] = useState<LeadFilters>({
    ...defaultQuery.filters,
    websiteQualityBelow: 100,
    includeHidden: false,
    savedOnly: false,
    niche: "",
    source: "",
    city: "",
  });
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [savedLeads, setSavedLeads] = useState<Lead[]>(initialSaved);
  const [recentScans, setRecentScans] = useState<ScanRun[]>(initialRecentScans);
  const [statusMessage, setStatusMessage] = useState(
    `Default ${config.defaultScan.city} ${config.defaultScan.niche.toString().toLowerCase()} demo loaded and ready.`,
  );
  const [statusTone, setStatusTone] = useState<"neutral" | "warning">("neutral");
  const [activeLead, setActiveLead] = useState<Lead | null>(initialLeads[0] ?? null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [activeTab, setActiveTab] = useState<"results" | "saved">("results");
  const [isScanning, startScanTransition] = useTransition();
  const [isExporting, startExportTransition] = useTransition();

  const visibleLeads = useMemo(() => {
    const sourceLeads = activeTab === "saved" ? savedLeads : leads;
    return sourceLeads
      .filter((lead) => {
        if (!filters.includeHidden && lead.hidden) return false;
        if (filters.savedOnly && !lead.saved) return false;
        if ((filters.minLeadScore ?? 0) > lead.lead_score) return false;
        if ((filters.minReviewCount ?? 0) > lead.review_count) return false;
        if (filters.websiteRequired && !lead.has_website) return false;
        if (filters.emailRequired && !lead.has_email) return false;
        if ((filters.websiteQualityBelow ?? 100) < 100 && lead.website_quality_score > (filters.websiteQualityBelow ?? 100)) return false;
        if (filters.niche && lead.niche !== filters.niche) return false;
        if (filters.source && lead.source_name !== filters.source) return false;
        if (filters.city && lead.city.toLowerCase() !== filters.city.toLowerCase()) return false;
        return true;
      })
      .sort((a, b) => b.lead_score - a.lead_score);
  }, [activeTab, filters, leads, savedLeads]);

  const summary = useMemo(
    () => ({
      total: visibleLeads.length,
      highPriority: visibleLeads.filter((lead) => lead.lead_score >= 75).length,
      websiteIssues: visibleLeads.filter((lead) => lead.has_website && lead.website_quality_score < 55).length,
      contactable: visibleLeads.filter((lead) => lead.has_phone || lead.has_email).length,
      savedLeads: savedLeads.length,
    }),
    [savedLeads.length, visibleLeads],
  );

  async function handleScan() {
    startScanTransition(async () => {
      try {
        setStatusMessage("Running scan...");
        setStatusTone("neutral");
        trackEvent("scan_started", {
          scanner: config.analyticsNamespace,
          niche: query.niche,
          city: query.city,
          demoMode: !!query.demoMode,
        });

        const payload = {
          ...query,
          filters: {
            minReviewCount: filters.minReviewCount,
            websiteRequired: filters.websiteRequired,
            emailRequired: filters.emailRequired,
            minLeadScore: filters.minLeadScore,
          },
        };

        const response = await fetch("/api/scan", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Scan failed");

        const json = (await response.json()) as { leads: Lead[]; scan: ScanRun; warning?: string };
        setLeads(json.leads);
        setRecentScans((current) => [json.scan, ...current].slice(0, 6));
        setStatusMessage(json.warning ?? `${json.scan.lead_count} ${config.entity.plural} loaded from ${json.scan.source_name}.`);
        setStatusTone(json.warning ? "warning" : "neutral");
        setActiveTab("results");
        setActiveLead(json.leads[0] ?? null);
        setSavedLeads((current) => {
          const savedMap = new Map(current.map((lead) => [lead.id, lead]));
          json.leads.forEach((lead) => {
            if (lead.saved) savedMap.set(lead.id, lead);
          });
          return Array.from(savedMap.values()).sort((a, b) => b.lead_score - a.lead_score);
        });
        trackEvent("scan_completed", {
          scanner: config.analyticsNamespace,
          resultCount: json.scan.lead_count,
          mode: json.scan.mode,
        });
      } catch {
        setStatusMessage("Scan failed. Please try again.");
        setStatusTone("warning");
      }
    });
  }

  async function handleLeadUpdate(leadId: string, payload: { saved?: boolean; hidden?: boolean; tags?: string[]; notes?: string }) {
    try {
      const updatedLead = await patchEntity(leadId, payload);
      setLeads((current) => current.map((lead) => (lead.id === leadId ? updatedLead : lead)));
      setSavedLeads((current) => {
        const next = current.filter((lead) => lead.id !== leadId);
        if (updatedLead.saved) next.unshift(updatedLead);
        return next.sort((a, b) => b.lead_score - a.lead_score);
      });
      setActiveLead((current) => (current?.id === leadId ? updatedLead : current));
      trackEvent("entity_updated", {
        scanner: config.analyticsNamespace,
        saved: payload.saved,
        hidden: payload.hidden,
        tagsChanged: Boolean(payload.tags),
        notesChanged: typeof payload.notes === "string",
      });
    } catch {
      setStatusMessage("Update failed. Please try again.");
      setStatusTone("warning");
    }
  }

  function exportCsv(savedOnly = false) {
    startExportTransition(async () => {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(savedOnly ? { savedOnly: true } : { ids: visibleLeads.map((lead) => lead.id) }),
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = savedOnly
        ? `${config.exportFilenamePrefix}-saved.csv`
        : `${config.exportFilenamePrefix}-results.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
      trackEvent("export_triggered", {
        scanner: config.analyticsNamespace,
        savedOnly,
        exportCount: visibleLeads.length,
      });
    });
  }

  return (
    <>
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />

      <main className="min-h-screen px-4 py-5 lg:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-5">
          <header className="glass-panel rounded-[1.8rem] px-6 py-5">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="font-mono text-xs uppercase tracking-[0.34em] text-sky-200/70">{config.productName}</div>
                <h1 className="mt-2 text-3xl font-semibold text-white">{config.headline}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">{config.dashboardIntro}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                >
                  Marketing site
                </Link>
                <button
                  onClick={() => exportCsv(false)}
                  disabled={isExporting}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:opacity-70"
                >
                  <Download className="mr-2 inline h-4 w-4" />
                  Export current
                </button>
                <button
                  onClick={() => exportCsv(true)}
                  disabled={isExporting}
                  className="rounded-full border border-sky-300/20 bg-sky-400/10 px-4 py-2.5 text-sm font-semibold text-sky-50 transition hover:bg-sky-400/20 disabled:opacity-70"
                >
                  <PanelRightOpen className="mr-2 inline h-4 w-4" />
                  Export saved
                </button>
                <button
                  onClick={() => {
                    setShowUpgrade(true);
                    trackEvent("upgrade_modal_opened", { scanner: config.analyticsNamespace });
                  }}
                  className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                >
                  <Sparkles className="mr-2 inline h-4 w-4" />
                  Upgrade
                </button>
              </div>
            </div>
          </header>

          <ScanControls
            query={query}
            filters={filters}
            scanning={isScanning}
            onQueryChange={setQuery}
            onFiltersChange={setFilters}
            onScan={handleScan}
          />

          <SummaryCards stats={summary} />

          <section className="grid gap-5 xl:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              <div className="glass-panel rounded-[1.75rem] p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">Scan status</div>
                    <p className={cn("mt-1 text-sm", statusTone === "warning" ? "text-amber-200" : "text-slate-300")}>{statusMessage}</p>
                  </div>
                  <button
                    onClick={handleScan}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                  >
                    <RefreshCw className="mr-2 inline h-4 w-4" />
                    Refresh scan
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {[
                  { id: "results", label: "Current results" },
                  { id: "saved", label: "Saved leads" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as "results" | "saved")}
                    className={cn(
                      "rounded-full border px-4 py-2.5 text-sm font-semibold transition",
                      activeTab === tab.id
                        ? "border-sky-300/20 bg-sky-400/10 text-sky-100"
                        : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}

                <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={!!filters.savedOnly}
                    onChange={(event) => setFilters((current) => ({ ...current, savedOnly: event.target.checked }))}
                    className="h-4 w-4 accent-sky-400"
                  />
                  Saved only
                </label>
                <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={!!filters.includeHidden}
                    onChange={(event) => setFilters((current) => ({ ...current, includeHidden: event.target.checked }))}
                    className="h-4 w-4 accent-sky-400"
                  />
                  Include hidden
                </label>
              </div>

              <ResultsTable
                leads={visibleLeads}
                activeLeadId={activeLead?.id}
                onSelectLead={setActiveLead}
                onToggleSave={(lead) => void handleLeadUpdate(lead.id, { saved: !lead.saved })}
                onToggleHide={(lead) => void handleLeadUpdate(lead.id, { hidden: !lead.hidden })}
              />
            </div>

            <aside className="space-y-5">
              <div className="glass-panel rounded-[1.75rem] p-5">
                <div className="font-mono text-xs uppercase tracking-[0.26em] text-sky-200/70">Stored workspace</div>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Total stored {config.entity.plural}</span>
                    <span className="font-semibold text-white">{stats.totalStored}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Saved {config.entity.plural} in SQLite</span>
                    <span className="font-semibold text-white">{savedLeads.length || stats.savedLeads}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>High-priority inventory</span>
                    <span className="font-semibold text-white">{stats.highPriority}</span>
                  </div>
                </div>
              </div>

              <div className="glass-panel rounded-[1.75rem] p-5">
                <div className="text-sm font-semibold text-white">Recent scans</div>
                <div className="mt-4 space-y-3">
                  {recentScans.length === 0 ? (
                    <div className="text-sm text-slate-400">Your scan history will appear here after the first run.</div>
                  ) : (
                    recentScans.map((scan) => (
                      <div key={scan.id} className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-white">
                              {scan.niche} in {scan.city}, {scan.state}
                            </div>
                            <div className="mt-1 text-xs text-slate-400">
                              {scan.lead_count} {config.entity.plural} | {scan.source_name}
                            </div>
                          </div>
                          <div
                            className={cn(
                              "rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                              scan.mode === "fallback" ? "bg-amber-400/10 text-amber-100" : "bg-sky-400/10 text-sky-100",
                            )}
                          >
                            {scan.mode}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </aside>
          </section>
        </div>
      </main>

      <LeadDrawer
        lead={activeLead}
        onClose={() => setActiveLead(null)}
        onUpdateLead={(leadId, payload) => void handleLeadUpdate(leadId, payload)}
      />
    </>
  );
}
