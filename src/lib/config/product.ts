import type { ProductConfig } from "@/lib/config/types";
import { niches } from "@/types/lead";

export const productConfig: ProductConfig = {
  productName: "Local B2B Lead Scanner",
  domainPlaceholder: "localb2bleadscanner.com",
  shortDescription: "Find local business leads worth contacting in minutes.",
  headline: "Find local business leads worth contacting in minutes",
  subheadline:
    "Scan a niche and city, rank leads by outreach potential, and focus on the businesses most likely to convert.",
  betaBadge: "Founding user beta",
  heroPrimaryCta: "Launch dashboard",
  heroSecondaryCta: "See the workflow",
  dashboardTagline: "Premium beta for local outbound teams",
  dashboardIntro:
    "Premium beta workflow for scanning a local niche, ranking outreach potential, and turning the best leads into a saved export queue.",
  pricingHeading: "Beta placeholder pricing for early users",
  pricingTiers: [
    { name: "Starter", price: "$49", note: "Beta placeholder pricing", bullets: ["1 seat", "Saved leads and exports", "Demo and fallback scans"] },
    { name: "Pro", price: "$149", note: "Beta placeholder pricing", bullets: ["5 seats planned", "Priority scan history", "Advanced enrichment next"] },
    { name: "Agency", price: "$399", note: "Beta placeholder pricing", bullets: ["Multi-operator workflow planned", "Higher volume exports", "Agency reporting roadmap"] },
  ],
  features: [
    {
      icon: "radar",
      title: "Local niche scans",
      description: "Search roofers, dentists, med spas, agencies, and more by city, state, ZIP, and radius.",
    },
    {
      icon: "sparkles",
      title: "Explainable scoring",
      description: "Rank leads with transparent quality and outreach signals instead of black-box lead scores.",
    },
    {
      icon: "database",
      title: "Save the good ones",
      description: "Persist saved leads, tags, notes, hidden junk, and recent scans in lightweight SQLite storage.",
    },
    {
      icon: "workflow",
      title: "Export-ready workflow",
      description: "Sort, filter, annotate, and export the exact slice of leads your outbound team wants to work.",
    },
  ],
  useCases: [
    "Local lead gen agencies can surface businesses with weak websites and contact friction before pitching retainers.",
    "Freelancers and consultants can walk into discovery calls with rankings, notes, and exported lead lists instead of screenshots.",
    "Appointment setters and SDR teams can focus on contactable businesses with enough quality signals to justify time.",
  ],
  faq: [
    {
      question: "Is this live or demo data?",
      answer: "Both. The MVP ships with seeded demo data for reliable demos and a swappable live adapter path with graceful fallback.",
    },
    {
      question: "Who is this for?",
      answer: "Lead gen agencies, freelancers, SDRs, consultants, outbound teams, and local marketers who need a fast shortlist.",
    },
    {
      question: "Does it include billing and auth?",
      answer: "Only a premium beta upgrade surface right now. The product stays lightweight so you can validate the workflow first.",
    },
  ],
  entity: {
    singular: "lead",
    plural: "leads",
    targetLabel: "business",
  },
  exportFilenamePrefix: "local-b2b-leads",
  metaTitle: "Local B2B Lead Scanner | Find local business leads worth contacting",
  metaDescription:
    "Scan a niche and city, rank local businesses by outreach potential, save the best leads, and export them for outbound work.",
  accentClassName: "text-sky-200",
  defaultScan: {
    niche: "Roofer",
    city: "Orlando",
    state: "FL",
    radius: 25,
    zip: "",
    demoMode: true,
    filters: {
      minReviewCount: 0,
      websiteRequired: false,
      emailRequired: false,
      minLeadScore: 0,
    },
  },
  supportedNiches: niches,
  analyticsNamespace: "local-b2b-lead-scanner",
};
