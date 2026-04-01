import { inspectWebsite } from "@/lib/enrichment/website";
import { scoreLead } from "@/lib/scoring/engine";
import type { LeadSourceAdapter, SourceResult } from "@/lib/sources/types";
import { nowIso, slugify } from "@/lib/utils";
import type { Lead, ScanQuery } from "@/types/lead";

type GeoResult = {
  lat: string;
  lon: string;
};

type OverpassElement = {
  id: number;
  tags?: Record<string, string>;
};

const nicheToTags: Record<string, string[]> = {
  Roofer: ['node["craft"="roofer"]', 'way["craft"="roofer"]'],
  HVAC: ['node["craft"="hvac"]', 'way["craft"="hvac"]', 'node["shop"="air_conditioning"]'],
  Dentist: ['node["amenity"="dentist"]', 'way["amenity"="dentist"]'],
  Attorney: ['node["office"="lawyer"]', 'way["office"="lawyer"]'],
  "Med Spa": ['node["beauty"="spa"]', 'way["beauty"="spa"]', 'node["shop"="cosmetics"]'],
  "Marketing Agency": ['node["office"="advertising_agency"]', 'way["office"="advertising_agency"]'],
  Plumber: ['node["craft"="plumber"]', 'way["craft"="plumber"]'],
  Landscaper: ['node["craft"="landscaper"]', 'way["craft"="landscaper"]', 'node["shop"="garden_centre"]'],
  Chiropractor: ['node["healthcare"="chiropractor"]', 'way["healthcare"="chiropractor"]'],
  Salon: ['node["shop"="hairdresser"]', 'way["shop"="hairdresser"]', 'node["beauty"="hair"]'],
};

async function geocode(query: ScanQuery): Promise<GeoResult | null> {
  const q = query.zip?.trim() ? `${query.zip}, ${query.state}` : `${query.city}, ${query.state}`;

  try {
    const params = new URLSearchParams({ q, format: "jsonv2", limit: "1" });
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: {
        "user-agent": "Local B2B Lead Scanner MVP",
      },
      next: { revalidate: 0 },
    });
    const json = (await response.json()) as GeoResult[];
    return json[0] ?? null;
  } catch {
    return null;
  }
}

function buildOverpassQuery(query: ScanQuery, geo: GeoResult) {
  const radiusMeters = Math.max(2000, Math.round((query.radius ?? 25) * 1609.34));
  const selectors = nicheToTags[query.niche] ?? [];
  const body = selectors
    .map((selector) => `${selector}(around:${radiusMeters},${geo.lat},${geo.lon});`)
    .join("\n");
  return `[out:json][timeout:20];
  (
    ${body}
  );
  out center tags 40;`;
}

function normalizeLead(element: OverpassElement, query: ScanQuery, adapterName: string): Lead {
  const tags = element.tags ?? {};
  const website = tags.website || tags["contact:website"] || "";
  const email = tags.email || tags["contact:email"] || "";
  const phone = tags.phone || tags["contact:phone"] || "";
  const createdAt = nowIso();

  const base = {
    business_name: tags.name || `${query.niche} Lead ${element.id}`,
    niche: query.niche,
    city: query.city,
    state: query.state,
    zip: query.zip ?? "",
    address: [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" "),
    phone,
    email,
    website,
    rating: null,
    review_count: 0,
    has_website: !!website,
    has_contact_page: false,
    has_email: !!email,
    has_phone: !!phone,
    site_title: "",
    meta_description: "",
    https_enabled: website.startsWith("https://"),
    clear_cta_detected: false,
    trust_signals_detected: false,
    booking_or_contact_form_detected: false,
  };

  const scored = scoreLead(base);

  return {
    id: `live-${slugify(`${adapterName}-${base.business_name}-${query.city}-${element.id}`)}`,
    ...base,
    website_quality_score: scored.website_quality_score,
    outreach_priority_score: scored.outreach_priority_score,
    lead_score: scored.lead_score,
    score_reasons: scored.score_reasons,
    source_name: adapterName,
    saved: false,
    hidden: false,
    tags: [],
    notes: "",
    created_at: createdAt,
    updated_at: createdAt,
  };
}

export class OverpassLeadAdapter implements LeadSourceAdapter {
  name = "OpenStreetMap Places";

  async scan(query: ScanQuery): Promise<SourceResult> {
    const geo = await geocode(query);
    if (!geo) {
      return {
        adapter: this.name,
        leads: [],
        mode: "fallback",
        warning: "Could not geocode the requested location for live mode.",
      };
    }

    try {
      const overpassQuery = buildOverpassQuery(query, geo);
      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: {
          "content-type": "text/plain;charset=UTF-8",
          "user-agent": "Local B2B Lead Scanner MVP",
        },
        body: overpassQuery,
        next: { revalidate: 0 },
      });

      if (!response.ok) {
        throw new Error(`Overpass request failed with ${response.status}`);
      }

      const json = (await response.json()) as { elements?: OverpassElement[] };
      const rawLeads = (json.elements ?? []).slice(0, 25).map((element) => normalizeLead(element, query, this.name));

      const enrichedLeads = await Promise.all(
        rawLeads.map(async (lead) => {
          if (!lead.website) return lead;
          const signals = await inspectWebsite(lead.website);
          const rescored = scoreLead({ ...lead, ...signals });
          return {
            ...lead,
            ...signals,
            website_quality_score: rescored.website_quality_score,
            outreach_priority_score: rescored.outreach_priority_score,
            lead_score: rescored.lead_score,
            score_reasons: rescored.score_reasons,
          };
        }),
      );

      const leads = enrichedLeads.filter((lead) => {
        const filters = query.filters ?? {};
        if ((filters.minReviewCount ?? 0) > lead.review_count) return false;
        if (filters.websiteRequired && !lead.has_website) return false;
        if (filters.emailRequired && !lead.has_email) return false;
        if ((filters.minLeadScore ?? 0) > lead.lead_score) return false;
        return true;
      });

      return {
        adapter: this.name,
        leads,
        mode: "live",
        warning:
          leads.length === 0
            ? "Live scan returned no results for that niche and radius. Try demo mode or broaden the search."
            : undefined,
      };
    } catch (error) {
      return {
        adapter: this.name,
        leads: [],
        mode: "fallback",
        warning: error instanceof Error ? error.message : "Live scan failed unexpectedly.",
      };
    }
  }
}
