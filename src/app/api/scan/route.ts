import { z } from "zod";

import { executeScan } from "@/lib/server";
import { niches } from "@/types/lead";

const scanSchema = z.object({
  niche: z.enum(niches),
  city: z.string().min(2),
  state: z.string().min(2).max(2),
  zip: z.string().optional(),
  radius: z.number().min(1).max(100).optional(),
  demoMode: z.boolean().optional(),
  filters: z
    .object({
      minReviewCount: z.number().min(0).optional(),
      websiteRequired: z.boolean().optional(),
      emailRequired: z.boolean().optional(),
      minLeadScore: z.number().min(0).max(100).optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = scanSchema.parse(body);
  const result = await executeScan(parsed);
  return Response.json(result);
}
