"use client";

import { LoaderCircle, Search, SlidersHorizontal } from "lucide-react";

import { niches } from "@/types/lead";
import type { LeadFilters, ScanQuery } from "@/types/lead";

type ScanControlsProps = {
  query: ScanQuery;
  filters: LeadFilters;
  scanning: boolean;
  onQueryChange: (query: ScanQuery) => void;
  onFiltersChange: (filters: LeadFilters) => void;
  onScan: () => void;
};

export function ScanControls({
  query,
  filters,
  scanning,
  onQueryChange,
  onFiltersChange,
  onScan,
}: ScanControlsProps) {
  return (
    <div className="glass-panel sticky top-4 z-20 rounded-[1.75rem] p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.26em] text-sky-200/70">Scan controls</div>
            <h2 className="mt-2 text-xl font-semibold text-white">Run a local lead scan</h2>
          </div>
          <button
            onClick={onScan}
            disabled={scanning}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {scanning ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {scanning ? "Scanning..." : "Scan now"}
          </button>
        </div>

        <div className="grid gap-3 xl:grid-cols-[1.15fr_1fr_0.7fr_0.7fr_0.8fr_0.8fr]">
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Niche</span>
            <select
              value={query.niche}
              onChange={(event) => onQueryChange({ ...query, niche: event.target.value })}
              className="w-full rounded-2xl border border-white/8 bg-white/6 px-4 py-3 text-sm text-slate-100 outline-none"
            >
              {niches.map((niche) => (
                <option key={niche} value={niche} className="bg-slate-950">
                  {niche}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.24em] text-slate-500">City</span>
            <input
              value={query.city}
              onChange={(event) => onQueryChange({ ...query, city: event.target.value })}
              className="w-full rounded-2xl border border-white/8 bg-white/6 px-4 py-3 text-sm text-slate-100 outline-none"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.24em] text-slate-500">State</span>
            <input
              value={query.state}
              maxLength={2}
              onChange={(event) => onQueryChange({ ...query, state: event.target.value.toUpperCase() })}
              className="w-full rounded-2xl border border-white/8 bg-white/6 px-4 py-3 text-sm text-slate-100 outline-none"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.24em] text-slate-500">ZIP</span>
            <input
              value={query.zip ?? ""}
              onChange={(event) => onQueryChange({ ...query, zip: event.target.value })}
              className="w-full rounded-2xl border border-white/8 bg-white/6 px-4 py-3 text-sm text-slate-100 outline-none"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Radius</span>
            <input
              type="number"
              min={1}
              max={100}
              value={query.radius ?? 25}
              onChange={(event) => onQueryChange({ ...query, radius: Number(event.target.value) })}
              className="w-full rounded-2xl border border-white/8 bg-white/6 px-4 py-3 text-sm text-slate-100 outline-none"
            />
          </label>

          <label className="flex items-end gap-3 rounded-2xl border border-white/8 bg-white/6 px-4 py-3">
            <input
              type="checkbox"
              checked={!!query.demoMode}
              onChange={(event) => onQueryChange({ ...query, demoMode: event.target.checked })}
              className="h-4 w-4 accent-sky-400"
            />
            <div>
              <div className="text-sm font-semibold text-white">Demo mode</div>
              <div className="text-xs text-slate-400">Safe fallback and seeded data</div>
            </div>
          </label>
        </div>

        <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
            <SlidersHorizontal className="h-4 w-4 text-sky-200" />
            Filters
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Min reviews</span>
              <input
                type="number"
                min={0}
                value={filters.minReviewCount ?? 0}
                onChange={(event) => onFiltersChange({ ...filters, minReviewCount: Number(event.target.value) })}
                className="w-full rounded-2xl border border-white/8 bg-white/6 px-4 py-3 text-sm text-slate-100 outline-none"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Min lead score</span>
              <input
                type="number"
                min={0}
                max={100}
                value={filters.minLeadScore ?? 0}
                onChange={(event) => onFiltersChange({ ...filters, minLeadScore: Number(event.target.value) })}
                className="w-full rounded-2xl border border-white/8 bg-white/6 px-4 py-3 text-sm text-slate-100 outline-none"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Website quality below</span>
              <input
                type="number"
                min={0}
                max={100}
                value={filters.websiteQualityBelow ?? 60}
                onChange={(event) => onFiltersChange({ ...filters, websiteQualityBelow: Number(event.target.value) })}
                className="w-full rounded-2xl border border-white/8 bg-white/6 px-4 py-3 text-sm text-slate-100 outline-none"
              />
            </label>

            <label className="flex items-end gap-3 rounded-2xl border border-white/8 bg-white/6 px-4 py-3">
              <input
                type="checkbox"
                checked={!!filters.websiteRequired}
                onChange={(event) => onFiltersChange({ ...filters, websiteRequired: event.target.checked })}
                className="h-4 w-4 accent-sky-400"
              />
              <div>
                <div className="text-sm font-semibold text-white">Website required</div>
                <div className="text-xs text-slate-400">Only return leads with websites</div>
              </div>
            </label>

            <label className="flex items-end gap-3 rounded-2xl border border-white/8 bg-white/6 px-4 py-3">
              <input
                type="checkbox"
                checked={!!filters.emailRequired}
                onChange={(event) => onFiltersChange({ ...filters, emailRequired: event.target.checked })}
                className="h-4 w-4 accent-sky-400"
              />
              <div>
                <div className="text-sm font-semibold text-white">Email required</div>
                <div className="text-xs text-slate-400">Prioritize list-building efficiency</div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
