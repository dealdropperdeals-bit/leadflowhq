import { productConfig } from "@/lib/config/product";
import type { Niche, ScanQuery } from "@/types/lead";

export const APP_NAME = productConfig.productName;

export const DEFAULT_SCAN_QUERY: ScanQuery = productConfig.defaultScan;

export const QUICK_TAGS = [
  "High Intent",
  "Needs Website Help",
  "Call First",
  "Has Budget Signals",
  "Weak CTA",
  "Low Reviews",
];

export const DEFAULT_NICHES: Niche[] = [
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
];
