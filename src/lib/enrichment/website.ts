type WebsiteSignals = {
  site_title: string;
  meta_description: string;
  has_contact_page: boolean;
  https_enabled: boolean;
  clear_cta_detected: boolean;
  trust_signals_detected: boolean;
  booking_or_contact_form_detected: boolean;
};

const ctaPattern = /(book now|schedule|request a quote|get started|call now|contact us|free estimate|consultation)/i;
const trustPattern = /(testimonials|licensed|insured|years of experience|before and after|case results|google reviews|award)/i;
const bookingPattern = /(form|booking|appointment|consultation|schedule)/i;
const contactPattern = /(contact|quote|estimate|appointment)/i;

function extractTag(html: string, tag: string) {
  const match = html.match(new RegExp(`<${tag}[^>]*>(.*?)<\\/${tag}>`, "i"));
  return match?.[1]?.replace(/\s+/g, " ").trim() ?? "";
}

function extractMetaDescription(html: string) {
  const match = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  return match?.[1]?.trim() ?? "";
}

export async function inspectWebsite(website: string): Promise<WebsiteSignals> {
  if (!website) {
    return {
      site_title: "",
      meta_description: "",
      has_contact_page: false,
      https_enabled: false,
      clear_cta_detected: false,
      trust_signals_detected: false,
      booking_or_contact_form_detected: false,
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), Number(process.env.LIVE_SCAN_TIMEOUT_MS ?? 7000));
    const response = await fetch(website, {
      headers: {
        "user-agent": "Local B2B Lead Scanner MVP",
      },
      signal: controller.signal,
      next: { revalidate: 0 },
    });
    clearTimeout(timeout);
    const html = await response.text();

    return {
      site_title: extractTag(html, "title"),
      meta_description: extractMetaDescription(html),
      has_contact_page: contactPattern.test(html),
      https_enabled: website.startsWith("https://"),
      clear_cta_detected: ctaPattern.test(html),
      trust_signals_detected: trustPattern.test(html),
      booking_or_contact_form_detected: bookingPattern.test(html),
    };
  } catch {
    return {
      site_title: "",
      meta_description: "",
      has_contact_page: false,
      https_enabled: website.startsWith("https://"),
      clear_cta_detected: false,
      trust_signals_detected: false,
      booking_or_contact_form_detected: false,
    };
  }
}
