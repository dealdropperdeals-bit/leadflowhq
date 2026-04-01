import { getDemoLeadCatalog } from "@/lib/demo/data";
import type { LeadSourceAdapter, SourceResult } from "@/lib/sources/types";
import type { Lead, ScanQuery } from "@/types/lead";

function applyScanFilters(leads: Lead[], query: ScanQuery) {
  const filters = query.filters ?? {};

  return leads.filter((lead) => {
    if (lead.niche.toLowerCase() !== query.niche.toLowerCase()) return false;
    if (query.city && lead.city.toLowerCase() !== query.city.toLowerCase()) return false;
    if (query.state && lead.state.toLowerCase() !== query.state.toLowerCase()) return false;
    if ((filters.minReviewCount ?? 0) > lead.review_count) return false;
    if (filters.websiteRequired && !lead.has_website) return false;
    if (filters.emailRequired && !lead.has_email) return false;
    if ((filters.minLeadScore ?? 0) > lead.lead_score) return false;
    return true;
  });
}

export class DemoLeadAdapter implements LeadSourceAdapter {
  name = "Seeded Demo Dataset";

  async scan(query: ScanQuery): Promise<SourceResult> {
    const leads = applyScanFilters(getDemoLeadCatalog(), query);

    return {
      adapter: this.name,
      leads,
      mode: "demo",
      warning:
        leads.length === 0
          ? "No demo leads matched your exact filters, so broaden the filters or switch locations."
          : undefined,
    };
  }
}
