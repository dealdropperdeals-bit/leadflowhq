import type { Niche, ScanQuery } from "@/types/lead";

export type PricingTier = {
  name: string;
  price: string;
  note: string;
  bullets: string[];
};

export type LandingFeature = {
  title: string;
  description: string;
  icon: "radar" | "sparkles" | "database" | "workflow";
};

export type ProductConfig = {
  productName: string;
  domainPlaceholder: string;
  shortDescription: string;
  headline: string;
  subheadline: string;
  betaBadge: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  dashboardTagline: string;
  dashboardIntro: string;
  pricingHeading: string;
  pricingTiers: PricingTier[];
  features: LandingFeature[];
  useCases: string[];
  faq: Array<{ question: string; answer: string }>;
  entity: {
    singular: string;
    plural: string;
    targetLabel: string;
  };
  exportFilenamePrefix: string;
  metaTitle: string;
  metaDescription: string;
  accentClassName: string;
  defaultScan: ScanQuery;
  supportedNiches: readonly Niche[];
  analyticsNamespace: string;
};
