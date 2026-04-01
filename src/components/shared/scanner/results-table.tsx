"use client";

import { Bookmark, EyeOff, ExternalLink, MessageSquareText, Tags } from "lucide-react";

import { formatMaybe } from "@/lib/utils";
import type { Lead } from "@/types/lead";

type ResultsTableProps = {
  leads: Lead[];
  activeLeadId?: string | null;
  onSelectLead: (lead: Lead) => void;
  onToggleSave: (lead: Lead) => void;
  onToggleHide: (lead: Lead) => void;
};

function scoreTone(score: number) {
  if (score >= 80) return "text-emerald-300";
  if (score >= 65) return "text-sky-200";
  if (score >= 50) return "text-amber-200";
  return "text-rose-200";
}

export function ResultsTable({
  leads,
  activeLeadId,
  onSelectLead,
  onToggleSave,
  onToggleHide,
}: ResultsTableProps) {
  return (
    <div className="glass-panel overflow-hidden rounded-[1.9rem]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] border-collapse">
          <thead className="bg-white/4 text-left text-[11px] uppercase tracking-[0.24em] text-slate-500">
            <tr>
              {["Business", "Niche", "City", "Phone", "Email", "Website", "Rating", "Reviews", "Website Quality", "Outreach Priority", "Lead Score", "Source", "Actions"].map((label) => (
                <th key={label} className="px-4 py-4 font-medium">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className={`border-t border-white/7 text-sm text-slate-200 transition hover:bg-white/[0.03] ${
                  activeLeadId === lead.id ? "bg-sky-400/[0.06]" : ""
                } ${lead.hidden ? "opacity-60" : ""}`}
              >
                <td className="px-4 py-4">
                  <button className="text-left" onClick={() => onSelectLead(lead)}>
                    <div className="font-semibold text-white">{lead.business_name}</div>
                    <div className="mt-1 text-xs text-slate-400">{lead.address || "Address unavailable"}</div>
                  </button>
                </td>
                <td className="px-4 py-4 text-slate-300">{lead.niche}</td>
                <td className="px-4 py-4 text-slate-300">
                  {lead.city}, {lead.state}
                </td>
                <td className="px-4 py-4">{formatMaybe(lead.phone)}</td>
                <td className="px-4 py-4">{formatMaybe(lead.email)}</td>
                <td className="px-4 py-4">
                  {lead.website ? (
                    <a href={lead.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sky-200 hover:text-white">
                      Open
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-4">{lead.rating ?? "-"}</td>
                <td className="px-4 py-4">{lead.review_count}</td>
                <td className={`px-4 py-4 font-semibold ${scoreTone(lead.website_quality_score)}`}>{lead.website_quality_score}</td>
                <td className={`px-4 py-4 font-semibold ${scoreTone(lead.outreach_priority_score)}`}>{lead.outreach_priority_score}</td>
                <td className={`px-4 py-4 font-mono text-lg font-semibold ${scoreTone(lead.lead_score)}`}>{lead.lead_score}</td>
                <td className="px-4 py-4 text-slate-400">{lead.source_name}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleSave(lead)}
                      className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                        lead.saved
                          ? "border-emerald-300/20 bg-emerald-400/12 text-emerald-100"
                          : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                      }`}
                    >
                      <Bookmark className="mr-1 inline h-3.5 w-3.5" />
                      Save
                    </button>
                    <button
                      onClick={() => onToggleHide(lead)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
                    >
                      <EyeOff className="mr-1 inline h-3.5 w-3.5" />
                      Hide
                    </button>
                    <button
                      onClick={() => onSelectLead(lead)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
                    >
                      <Tags className="mr-1 inline h-3.5 w-3.5" />
                      Tag
                    </button>
                    <button
                      onClick={() => onSelectLead(lead)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
                    >
                      <MessageSquareText className="mr-1 inline h-3.5 w-3.5" />
                      Explain
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {leads.length === 0 ? (
        <div className="px-6 py-12 text-center text-slate-400">No leads matched the current filters. Try relaxing the scan or table filters.</div>
      ) : null}
    </div>
  );
}
