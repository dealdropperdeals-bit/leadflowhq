import { DEFAULT_NICHES } from "@/lib/constants";
import { scoreLead } from "@/lib/scoring/engine";
import { nowIso, slugify } from "@/lib/utils";
import type { Lead, Niche } from "@/types/lead";

const citySeeds = [
  { city: "Orlando", state: "FL", zip: "32801" },
  { city: "Tampa", state: "FL", zip: "33602" },
  { city: "Austin", state: "TX", zip: "78701" },
  { city: "Charlotte", state: "NC", zip: "28202" },
  { city: "Phoenix", state: "AZ", zip: "85004" },
  { city: "Nashville", state: "TN", zip: "37203" },
];

const nichePrefixes: Record<Niche, string[]> = {
  Roofer: ["Summit", "Atlas", "Beacon", "Skyline", "Heritage", "Evercrest"],
  HVAC: ["BluePeak", "Velocity", "Comfort", "PrimeAir", "Reliable", "Arctic"],
  Dentist: ["Harbor", "Lakefront", "Bright", "Oakline", "Crown", "Sage"],
  Attorney: ["Northgate", "Mercer", "Civic", "Harbor", "Granite", "Summit"],
  "Med Spa": ["Halo", "Contour", "Velvet", "Renew", "Aster", "Luma"],
  "Marketing Agency": ["Signal", "Northbound", "Launch", "Pivot", "Orbit", "Rally"],
  Plumber: ["FlowRight", "RapidRooter", "Anchor", "PrimePipe", "BlueLine", "IronOak"],
  Landscaper: ["Greenline", "Stone & Stem", "Everfield", "BlueSpruce", "Terra", "Canopy"],
  Chiropractor: ["Aligned", "SpineWorks", "WellCore", "Motion", "Balanced", "Peak"],
  Salon: ["Gloss", "Luna", "Velvet", "Oak & Ivory", "Muse", "Aurora"],
};

const nicheSuffixes: Record<Niche, string[]> = {
  Roofer: ["Roofing", "Roof Systems", "Exterior Co.", "Storm Repair", "Roof & Solar", "Roofing Group"],
  HVAC: ["Heating & Air", "Climate Systems", "HVAC Pros", "Indoor Comfort", "Air Service", "Cooling Co."],
  Dentist: ["Dental Studio", "Family Dentistry", "Dental Arts", "Smile Clinic", "Dental Group", "Dental Care"],
  Attorney: ["Law Group", "Legal", "Trial Counsel", "Law Office", "Attorneys", "Injury Law"],
  "Med Spa": ["Med Spa", "Aesthetics", "Skin Studio", "Cosmetic Lounge", "Wellness Med Spa", "Aesthetic Lab"],
  "Marketing Agency": ["Creative", "Digital", "Growth Studio", "Media House", "Marketing Co.", "Lead Lab"],
  Plumber: ["Plumbing", "Rooter Co.", "Pipe Works", "Drain Experts", "Plumbing Pros", "Water Systems"],
  Landscaper: ["Landscaping", "Outdoor Design", "Grounds Co.", "Landscape Studio", "Property Care", "Outdoor Living"],
  Chiropractor: ["Chiropractic", "Spine Center", "Wellness Chiropractic", "Back & Body", "Alignment Studio", "Health Center"],
  Salon: ["Salon", "Hair Studio", "Beauty Lounge", "Color Bar", "Salon Collective", "Blowout Studio"],
};

const demoTags = ["Family-owned", "Fast response", "High-ticket", "Busy market", "Weak follow-up"];

function makeLead(niche: Niche, cityIndex: number, idx: number): Lead {
  const citySeed = citySeeds[cityIndex % citySeeds.length];
  const prefix = nichePrefixes[niche][idx % nichePrefixes[niche].length];
  const suffix = nicheSuffixes[niche][(idx + cityIndex) % nicheSuffixes[niche].length];
  const businessName = `${prefix} ${citySeed.city} ${suffix}`;
  const hasWebsite = (idx + cityIndex) % 5 !== 0;
  const hasEmail = hasWebsite && idx % 3 !== 0;
  const hasPhone = true;
  const hasContactPage = hasWebsite && idx % 4 !== 0;
  const cta = hasWebsite && idx % 3 !== 1;
  const trustSignals = hasWebsite && idx % 4 !== 1;
  const booking = hasWebsite && (niche === "Dentist" || niche === "Med Spa" || niche === "Salon" || idx % 2 === 0);
  const rating = Number((3.8 + ((idx + cityIndex) % 12) * 0.1).toFixed(1));
  const reviewCount = 4 + ((idx * 11 + cityIndex * 9) % 137);
  const slug = slugify(businessName);
  const website = hasWebsite ? `https://www.${slug}.${idx % 2 === 0 ? "com" : "co"}` : "";
  const email = hasEmail ? `hello@${slug}.${idx % 2 === 0 ? "com" : "co"}` : "";
  const createdAt = nowIso();

  const scored = scoreLead({
    business_name: businessName,
    niche,
    city: citySeed.city,
    state: citySeed.state,
    zip: citySeed.zip,
    address: `${100 + idx * 7} ${citySeed.city} Commerce Ave`,
    phone: `(407) 555-${String(1000 + idx + cityIndex).slice(-4)}`,
    email,
    website,
    rating,
    review_count: reviewCount,
    has_website: hasWebsite,
    has_contact_page: hasContactPage,
    has_email: !!email,
    has_phone: hasPhone,
    site_title: hasWebsite ? `${businessName} | ${citySeed.city} ${niche}` : "",
    meta_description: hasWebsite
      ? `${businessName} helps ${citySeed.city} customers with reliable ${niche.toLowerCase()} service and a fast response team.`
      : "",
    https_enabled: hasWebsite,
    clear_cta_detected: cta,
    trust_signals_detected: trustSignals,
    booking_or_contact_form_detected: booking,
  });

  return {
    id: `demo-${slug}`,
    business_name: businessName,
    niche,
    city: citySeed.city,
    state: citySeed.state,
    zip: citySeed.zip,
    address: `${100 + idx * 7} ${citySeed.city} Commerce Ave`,
    phone: `(407) 555-${String(1000 + idx + cityIndex).slice(-4)}`,
    email,
    website,
    rating,
    review_count: reviewCount,
    has_website: hasWebsite,
    has_contact_page: hasContactPage,
    has_email: !!email,
    has_phone: hasPhone,
    site_title: hasWebsite ? `${businessName} | ${citySeed.city} ${niche}` : "",
    meta_description: hasWebsite
      ? `${businessName} helps ${citySeed.city} customers with reliable ${niche.toLowerCase()} service and a fast response team.`
      : "",
    https_enabled: hasWebsite,
    clear_cta_detected: cta,
    trust_signals_detected: trustSignals,
    booking_or_contact_form_detected: booking,
    website_quality_score: scored.website_quality_score,
    outreach_priority_score: scored.outreach_priority_score,
    lead_score: scored.lead_score,
    score_reasons: scored.score_reasons,
    source_name: "Seeded Demo Dataset",
    saved: idx % 14 === 0,
    hidden: idx % 21 === 0,
    tags: idx % 4 === 0 ? [demoTags[idx % demoTags.length]] : [],
    notes:
      idx % 6 === 0
        ? `Worth reviewing for ${niche.toLowerCase()} outreach. Looks like a solid ${citySeed.city} target with room to improve conversion.`
        : "",
    created_at: createdAt,
    updated_at: createdAt,
  };
}

export function getDemoLeadCatalog() {
  const leads: Lead[] = [];

  DEFAULT_NICHES.forEach((niche, nicheIndex) => {
    for (let cityIndex = 0; cityIndex < citySeeds.length; cityIndex += 1) {
      leads.push(makeLead(niche, cityIndex, nicheIndex * 6 + cityIndex));
    }
  });

  return leads;
}
