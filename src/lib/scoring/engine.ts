import { scoringConfig } from "@/lib/scoring/config";
import { clamp } from "@/lib/utils";
import type { Lead, ScoreReason } from "@/types/lead";

type LeadInput = Partial<Lead> & {
  business_name: string;
  niche: string;
  city: string;
  state: string;
};

function pushReason(
  reasons: ScoreReason[],
  label: string,
  detail: string,
  impact: number,
  category: ScoreReason["category"],
) {
  reasons.push({ label, detail, impact, category });
}

export function scoreLead<T extends LeadInput>(lead: T) {
  const reasons: ScoreReason[] = [];
  const qualityWeights = scoringConfig.websiteQuality;
  let websiteQuality = qualityWeights.base;

  if (lead.has_website) {
    websiteQuality += qualityWeights.website;
    pushReason(reasons, "Website present", "The business has a discoverable website.", qualityWeights.website, "quality");
  } else {
    pushReason(reasons, "No website", "Missing website creates a strong website-services opportunity.", 20, "opportunity");
  }

  if (lead.https_enabled) {
    websiteQuality += qualityWeights.https;
    pushReason(reasons, "HTTPS enabled", "Secure browsing is a good baseline quality signal.", qualityWeights.https, "quality");
  }
  if (lead.site_title) {
    websiteQuality += qualityWeights.title;
    pushReason(reasons, "Title tag found", "Homepage title exists and looks indexable.", qualityWeights.title, "quality");
  }
  if (lead.meta_description) {
    websiteQuality += qualityWeights.metaDescription;
    pushReason(reasons, "Meta description found", "Site has at least a basic conversion description.", qualityWeights.metaDescription, "quality");
  }
  if (lead.has_contact_page) {
    websiteQuality += qualityWeights.contactPage;
    pushReason(reasons, "Contact page detected", "Users can likely reach the business without friction.", qualityWeights.contactPage, "quality");
  }
  if (lead.clear_cta_detected) {
    websiteQuality += qualityWeights.clearCta;
    pushReason(reasons, "Clear CTA present", "The homepage signals a clear next step.", qualityWeights.clearCta, "quality");
  } else if (lead.has_website) {
    pushReason(reasons, "Weak CTA", "The site likely lacks a strong visible call to action.", 10, "opportunity");
  }
  if (lead.trust_signals_detected) {
    websiteQuality += qualityWeights.trustSignals;
    pushReason(reasons, "Trust signals detected", "Reviews, credentials, or proof points appear on the site.", qualityWeights.trustSignals, "quality");
  } else if (lead.has_website) {
    pushReason(reasons, "Thin trust signals", "The site looks light on credibility elements.", 8, "opportunity");
  }
  if (lead.booking_or_contact_form_detected) {
    websiteQuality += qualityWeights.bookingForm;
    pushReason(reasons, "Form or booking flow found", "The site supports lead capture directly on-page.", qualityWeights.bookingForm, "quality");
  }

  websiteQuality = clamp(Math.round(websiteQuality));

  const outreachWeights = scoringConfig.outreachPriority;
  let outreachPriority = 8;

  if (!lead.has_website) {
    outreachPriority += outreachWeights.missingWebsite;
  }
  if (!lead.has_email) {
    outreachPriority += outreachWeights.missingEmail;
    pushReason(reasons, "No public email", "Contact info looks incomplete, which often means outreach ops can help.", outreachWeights.missingEmail, "outreach");
  }
  if (!lead.has_contact_page && lead.has_website) {
    outreachPriority += outreachWeights.missingContactPage;
  }
  if (!lead.clear_cta_detected && lead.has_website) {
    outreachPriority += outreachWeights.weakCta;
  }
  if ((lead.review_count ?? 0) < 20) {
    outreachPriority += outreachWeights.lowReviews;
    pushReason(reasons, "Lower review count", "The business has room to improve trust and visibility.", outreachWeights.lowReviews, "outreach");
  }
  if ((lead.rating ?? 0) > 0 && (lead.rating ?? 0) < 4.4) {
    outreachPriority += outreachWeights.ratingGap;
    pushReason(reasons, "Rating gap", "The reputation profile is decent but not dominant for the market.", outreachWeights.ratingGap, "outreach");
  }
  if (lead.has_phone) {
    outreachPriority += outreachWeights.hasPhone;
    pushReason(reasons, "Phone available", "The lead is contactable immediately for outbound.", outreachWeights.hasPhone, "credibility");
  }
  if (lead.has_website && websiteQuality < 55) {
    outreachPriority += outreachWeights.hasWebsiteButWeakSignals;
  }

  outreachPriority = clamp(Math.round(outreachPriority));

  const reviewScore = clamp(Math.round(((lead.review_count ?? 0) / 120) * 100));
  const ratingScore = lead.rating ? clamp(Math.round((lead.rating / 5) * 100)) : 30;
  const completenessScore = clamp(
    (lead.has_phone ? 35 : 0) +
      (lead.has_email ? 30 : 0) +
      (lead.has_website ? 20 : 0) +
      (lead.address ? 15 : 0),
  );
  const reputationScore = Math.round(reviewScore * 0.45 + ratingScore * 0.55);

  const leadScore = clamp(
    Math.round(
      scoringConfig.leadScore.base +
        websiteQuality * scoringConfig.leadScore.websiteQualityWeight +
        outreachPriority * scoringConfig.leadScore.outreachPriorityWeight +
        completenessScore * scoringConfig.leadScore.completenessWeight +
        reputationScore * scoringConfig.leadScore.reputationWeight,
    ),
  );

  if ((lead.rating ?? 0) >= 4.7) {
    pushReason(reasons, "Strong rating", "The business already has solid customer sentiment.", 12, "credibility");
  }
  if ((lead.review_count ?? 0) >= 40) {
    pushReason(reasons, "Established review footprint", "The listing has enough social proof to be worth prioritizing.", 10, "credibility");
  }

  return {
    website_quality_score: websiteQuality,
    outreach_priority_score: outreachPriority,
    lead_score: leadScore,
    score_reasons: reasons.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)).slice(0, 8),
  };
}
