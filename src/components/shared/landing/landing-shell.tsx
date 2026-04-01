import Link from "next/link";
import { ArrowRight, BadgeDollarSign, Database, Radar, ShieldCheck, Sparkles, Workflow } from "lucide-react";

import type { ProductConfig } from "@/lib/config/types";

const iconMap = {
  radar: Radar,
  sparkles: Sparkles,
  database: Database,
  workflow: Workflow,
};

type LandingShellProps = {
  config: ProductConfig;
};

export function LandingShell({ config }: LandingShellProps) {
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 subtle-grid opacity-30" />

      <header className="sticky top-0 z-30 border-b border-white/8 bg-[#08111dcc]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.36em] text-sky-200/70">{config.productName}</div>
            <div className="text-sm text-slate-300">{config.dashboardTagline}</div>
          </div>
          <div className="flex items-center gap-3">
            <a href="#pricing" className="hidden text-sm text-slate-300 transition hover:text-white sm:block">
              Pricing
            </a>
            <Link
              href="/dashboard"
              className="rounded-full border border-sky-300/20 bg-sky-400/10 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:border-sky-300/40 hover:bg-sky-400/20"
            >
              Enter App
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-16 pt-18 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:pb-24 lg:pt-24">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100/80">
            <ShieldCheck className="h-3.5 w-3.5" />
            {config.betaBadge}
          </div>

          <div className="space-y-6">
            <h1 className="max-w-3xl font-mono text-5xl leading-[0.94] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              {config.headline}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300 text-balance">{config.subheadline}</p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              {config.heroPrimaryCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#product"
              className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/5 px-6 py-3.5 font-semibold text-slate-100 transition hover:border-white/20 hover:bg-white/8"
            >
              {config.heroSecondaryCta}
            </a>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              [`${config.supportedNiches.length} niches`, "Config-driven scanner surface"],
              ["Seeded demo mode", "Reliable demos out of the box"],
              ["CSV exports", "Current view or saved leads"],
            ].map(([label, value]) => (
              <div key={label} className="glass-panel rounded-2xl px-4 py-4">
                <div className="text-sm text-slate-400">{label}</div>
                <div className="mt-1 text-base font-semibold text-white">{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div id="product" className="relative">
          <div className="absolute inset-0 -rotate-3 rounded-[2rem] bg-gradient-to-br from-sky-400/20 via-transparent to-cyan-300/10 blur-3xl" />
          <div className="glass-panel relative overflow-hidden rounded-[2rem] border-white/10 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="font-mono text-xs uppercase tracking-[0.24em] text-sky-200/65">Scan workstation</div>
                <div className="text-lg font-semibold text-white">
                  {config.defaultScan.city} {config.defaultScan.niche.toString().toLowerCase()} run
                </div>
              </div>
              <div className="rounded-full border border-emerald-300/15 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                Demo mode ready
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/8 bg-[#07101c] p-4">
              <div className="grid gap-3 border-b border-white/6 pb-4 sm:grid-cols-4">
                {[config.defaultScan.niche, config.defaultScan.city, config.defaultScan.state, `${config.defaultScan.radius ?? 25} mi`].map((value) => (
                  <div key={String(value)} className="rounded-2xl bg-white/4 px-3 py-3 text-sm text-slate-300">
                    {value}
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  [`${config.entity.plural} found`, "6"],
                  ["High priority", "3"],
                  ["Website issues", "4"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/7 bg-white/3 px-4 py-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</div>
                    <div className="mt-2 font-mono text-3xl text-white">{value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 overflow-hidden rounded-3xl border border-white/8">
                <div className="grid grid-cols-[2fr_repeat(4,1fr)] gap-3 border-b border-white/6 bg-white/3 px-4 py-3 text-xs uppercase tracking-[0.24em] text-slate-500">
                  <span>{config.entity.targetLabel}</span>
                  <span>Website</span>
                  <span>Reviews</span>
                  <span>Priority</span>
                  <span>Score</span>
                </div>
                {[
                  ["Summit Orlando Roofing", "Needs CTA", "18", "79", "84"],
                  ["Atlas Orlando Roof Systems", "No site", "12", "88", "82"],
                  ["Beacon Orlando Exterior Co.", "Strong", "54", "63", "80"],
                ].map((row) => (
                  <div key={row[0]} className="grid grid-cols-[2fr_repeat(4,1fr)] gap-3 border-b border-white/6 px-4 py-3 text-sm text-slate-200 last:border-b-0">
                    {row.map((cell) => (
                      <span key={cell}>{cell}</span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <div className="grid gap-4 lg:grid-cols-4">
          {config.features.map((feature) => {
            const Icon = iconMap[feature.icon];
            return (
              <article key={feature.title} className="glass-panel rounded-3xl p-6">
                <div className="mb-5 inline-flex rounded-2xl border border-white/10 bg-white/6 p-3 text-sky-100">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold text-white">{feature.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
        <div className="glass-panel rounded-[2rem] p-8">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-sky-200/70">Use cases</div>
          <h2 className="mt-4 text-3xl font-semibold text-white">Built for people who need a better first outbound list</h2>
          <div className="mt-8 space-y-5 text-slate-300">
            {config.useCases.map((useCase) => (
              <p key={useCase}>{useCase}</p>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {config.faq.map((item) => (
            <article key={item.question} className="glass-panel rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-white">{item.question}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-sky-200/70">Pricing</div>
            <h2 className="mt-3 text-3xl font-semibold text-white">{config.pricingHeading}</h2>
          </div>
          <div className="rounded-full border border-amber-300/15 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-100">
            Billing modal only for this MVP
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {config.pricingTiers.map((plan) => (
            <article key={plan.name} className="glass-panel rounded-[2rem] p-7">
              <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                {plan.name}
              </div>
              <div className="mt-5 flex items-end gap-2">
                <span className="font-mono text-5xl text-white">{plan.price}</span>
                <span className="pb-2 text-sm text-slate-400">/month</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">{plan.note}</p>
              <div className="mt-6 space-y-3">
                {plan.bullets.map((bullet) => (
                  <div key={bullet} className="flex items-center gap-3 text-sm text-slate-200">
                    <BadgeDollarSign className="h-4 w-4 text-sky-200" />
                    {bullet}
                  </div>
                ))}
              </div>
              <Link
                href="/dashboard"
                className="mt-8 inline-flex items-center justify-center rounded-full border border-white/12 bg-white/6 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Explore beta
              </Link>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/8 px-6 py-8 text-sm text-slate-400 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>{config.shortDescription}</div>
          <Link href="/dashboard" className="font-semibold text-sky-200">
            Open the dashboard
          </Link>
        </div>
      </footer>
    </main>
  );
}
