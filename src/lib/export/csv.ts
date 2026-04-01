import type { Lead } from "@/types/lead";

const csvColumns: Array<keyof Lead | "score_reason_summary"> = [
  "business_name",
  "niche",
  "city",
  "state",
  "zip",
  "address",
  "phone",
  "email",
  "website",
  "rating",
  "review_count",
  "website_quality_score",
  "outreach_priority_score",
  "lead_score",
  "source_name",
  "saved",
  "hidden",
  "tags",
  "notes",
  "score_reason_summary",
];

function escapeCsv(value: unknown) {
  const stringified = Array.isArray(value) ? value.join("; ") : `${value ?? ""}`;
  return `"${stringified.replace(/"/g, '""')}"`;
}

export function leadsToCsv(leads: Lead[]) {
  const rows = leads.map((lead) =>
    csvColumns
      .map((column) => {
        if (column === "score_reason_summary") {
          return escapeCsv(lead.score_reasons.map((reason) => `${reason.label}: ${reason.detail}`).join(" | "));
        }
        return escapeCsv(lead[column]);
      })
      .join(","),
  );

  return [csvColumns.join(","), ...rows].join("\n");
}
