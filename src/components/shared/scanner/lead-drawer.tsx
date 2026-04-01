"use client";

import { ExternalLink, X } from "lucide-react";
import { useState } from "react";

import { QUICK_TAGS } from "@/lib/constants";
import type { Lead } from "@/types/lead";

type LeadDrawerProps = {
  lead: Lead | null;
  onClose: () => void;
  onUpdateLead: (leadId: string, payload: { tags?: string[]; notes?: string; saved?: boolean; hidden?: boolean }) => void;
};

export function LeadDrawer({ lead, onClose, onUpdateLead }: LeadDrawerProps) {
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  if (!lead) return null;

  const activeLead = lead;
  const notes = noteDrafts[activeLead.id] ?? activeLead.notes;

  function toggleTag(tag: string) {
    const nextTags = activeLead.tags.includes(tag)
      ? activeLead.tags.filter((item) => item !== tag)
      : [...activeLead.tags, tag];
    onUpdateLead(activeLead.id, { tags: nextTags });
  }

  return (
    <aside className="glass-panel fixed inset-y-5 right-5 z-40 w-[420px] rounded-[2rem] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.26em] text-sky-200/70">Lead details</div>
          <h3 className="mt-2 text-2xl font-semibold text-white">{activeLead.business_name}</h3>
          <div className="mt-2 text-sm text-slate-400">
            {activeLead.city}, {activeLead.state} | {activeLead.niche}
          </div>
        </div>
        <button onClick={onClose} className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          ["Lead Score", activeLead.lead_score],
          ["Website", activeLead.website_quality_score],
          ["Priority", activeLead.outreach_priority_score],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/8 bg-white/5 px-4 py-4">
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</div>
            <div className="mt-2 font-mono text-3xl text-white">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-3xl border border-white/8 bg-white/4 p-4">
        <div className="text-sm font-semibold text-white">Contact and site</div>
        <div className="mt-3 space-y-2 text-sm text-slate-300">
          <div>Phone: {activeLead.phone || "-"}</div>
          <div>Email: {activeLead.email || "-"}</div>
          <div>
            Website:{" "}
            {activeLead.website ? (
              <a href={activeLead.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sky-200">
                Open site <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              "-"
            )}
          </div>
          <div>Address: {activeLead.address || "-"}</div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-white/8 bg-white/4 p-4">
        <div className="text-sm font-semibold text-white">Why this score?</div>
        <div className="mt-4 space-y-3">
          {activeLead.score_reasons.map((reason) => (
            <div key={`${reason.label}-${reason.detail}`} className="rounded-2xl border border-white/8 bg-[#07101c] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-slate-100">{reason.label}</div>
                <div className="font-mono text-sm text-sky-200">{reason.impact > 0 ? `+${reason.impact}` : reason.impact}</div>
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-400">{reason.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-white/8 bg-white/4 p-4">
        <div className="text-sm font-semibold text-white">Tags</div>
        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK_TAGS.map((tag) => {
            const active = activeLead.tags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                  active ? "border-sky-300/30 bg-sky-400/12 text-sky-100" : "border-white/10 bg-white/6 text-slate-300 hover:bg-white/10"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-white/8 bg-white/4 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-white">Notes</div>
          <button
            onClick={() => onUpdateLead(activeLead.id, { notes })}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:bg-white/10"
          >
            Save note
          </button>
        </div>
        <textarea
          value={notes}
          onChange={(event) =>
            setNoteDrafts((current) => ({
              ...current,
              [activeLead.id]: event.target.value,
            }))
          }
          placeholder="Add outreach notes, handoff context, or follow-up ideas."
          className="mt-4 min-h-28 w-full rounded-3xl border border-white/8 bg-[#07101c] px-4 py-3 text-sm text-slate-100 outline-none"
        />
      </div>
    </aside>
  );
}
