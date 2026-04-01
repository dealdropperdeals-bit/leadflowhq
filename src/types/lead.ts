export const niches = [
  "Roofer",
  "HVAC",
  "Dentist",
  "Attorney",
  "Med Spa",
  "Marketing Agency",
  "Plumber",
  "Landscaper",
  "Chiropractor",
  "Salon",
] as const;

export type Niche = (typeof niches)[number];

export type ScoreReason = {
  label: string;
  detail: string;
  impact: number;
  category: "quality" | "outreach" | "opportunity" | "credibility";
};

export type Lead = {
  id: string;
  business_name: string;
  niche: Niche | string;
  city: string;
  state: string;
  zip: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  rating: number | null;
  review_count: number;
  has_website: boolean;
  has_contact_page: boolean;
  has_email: boolean;
  has_phone: boolean;
  site_title: string;
  meta_description: string;
  https_enabled: boolean;
  clear_cta_detected: boolean;
  trust_signals_detected: boolean;
  booking_or_contact_form_detected: boolean;
  website_quality_score: number;
  outreach_priority_score: number;
  lead_score: number;
  score_reasons: ScoreReason[];
  source_name: string;
  saved: boolean;
  hidden: boolean;
  tags: string[];
  notes: string;
  created_at: string;
  updated_at: string;
};

export type ScanFilters = {
  minReviewCount?: number;
  websiteRequired?: boolean;
  emailRequired?: boolean;
  minLeadScore?: number;
};

export type LeadFilters = ScanFilters & {
  savedOnly?: boolean;
  includeHidden?: boolean;
  websiteQualityBelow?: number;
  niche?: string;
  source?: string;
  city?: string;
};

export type ScanQuery = {
  niche: Niche | string;
  city: string;
  state: string;
  zip?: string;
  radius?: number;
  demoMode?: boolean;
  filters?: ScanFilters;
};

export type ScanRun = {
  id: string;
  niche: string;
  city: string;
  state: string;
  zip: string;
  radius: number;
  source_name: string;
  lead_count: number;
  mode: "demo" | "live" | "fallback";
  status_message: string;
  created_at: string;
};

export type ScanResponse = {
  leads: Lead[];
  scan: ScanRun;
  warning?: string;
};

export type LeadUpdateInput = {
  saved?: boolean;
  hidden?: boolean;
  tags?: string[];
  notes?: string;
};
