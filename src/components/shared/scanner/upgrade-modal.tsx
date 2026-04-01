"use client";

import { Crown, X } from "lucide-react";

type UpgradeModalProps = {
  open: boolean;
  onClose: () => void;
};

export function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#02060dcc]/80 px-4 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-xl rounded-[2rem] p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-100">
              <Crown className="h-3.5 w-3.5" />
              Beta upgrade
            </div>
            <h3 className="mt-4 text-3xl font-semibold text-white">Move from lead sorting to team throughput</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              This is a polished billing placeholder for the MVP. Real subscriptions are intentionally out of scope, but the product positioning is ready.
            </p>
          </div>
          <button onClick={onClose} className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[
            ["Starter", "$49", "Solo operator workflow"],
            ["Pro", "$149", "Small outbound pod"],
            ["Agency", "$399", "Multi-client operations"],
          ].map(([name, price, detail]) => (
            <div key={name} className="rounded-3xl border border-white/8 bg-white/4 p-5">
              <div className="text-sm font-semibold text-white">{name}</div>
              <div className="mt-3 font-mono text-4xl text-sky-100">{price}</div>
              <div className="mt-2 text-sm text-slate-400">{detail}</div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-full bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-200"
        >
          Close beta modal
        </button>
      </div>
    </div>
  );
}
