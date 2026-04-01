import { AlertTriangle, Bookmark, Globe, ScanSearch, Target } from "lucide-react";

type SummaryCardsProps = {
  stats: {
    total: number;
    highPriority: number;
    websiteIssues: number;
    contactable: number;
    savedLeads: number;
  };
};

const cards = [
  { key: "total", label: "Total leads", icon: ScanSearch },
  { key: "highPriority", label: "High priority", icon: Target },
  { key: "websiteIssues", label: "Website issues", icon: AlertTriangle },
  { key: "contactable", label: "With contact info", icon: Globe },
  { key: "savedLeads", label: "Saved leads", icon: Bookmark },
] as const;

export function SummaryCards({ stats }: SummaryCardsProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = stats[card.key];
        return (
          <article key={card.key} className="glass-panel rounded-[1.6rem] p-5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-sm">{card.label}</span>
              <Icon className="h-4 w-4 text-sky-200" />
            </div>
            <div className="mt-5 font-mono text-4xl text-white">{value}</div>
          </article>
        );
      })}
    </div>
  );
}
