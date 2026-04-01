import { z } from "zod";

import { getLeadsByIds, getSavedLeads } from "@/lib/db";
import { leadsToCsv } from "@/lib/export/csv";

const exportSchema = z.object({
  ids: z.array(z.string()).optional(),
  savedOnly: z.boolean().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = exportSchema.parse(body);
  const leads = parsed.savedOnly ? getSavedLeads() : getLeadsByIds(parsed.ids ?? []);
  const csv = leadsToCsv(leads);

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="local-b2b-leads.csv"`,
    },
  });
}
