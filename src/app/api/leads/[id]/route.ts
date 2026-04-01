import { z } from "zod";

import { getLead, updateLead } from "@/lib/db";

const leadUpdateSchema = z.object({
  saved: z.boolean().optional(),
  hidden: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const existing = getLead(id);

  if (!existing) {
    return Response.json({ error: "Lead not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = leadUpdateSchema.parse(body);
  const updated = updateLead(id, parsed);
  return Response.json(updated);
}
