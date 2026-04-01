import type { Lead, ScanQuery } from "@/types/lead";

export type SourceResult = {
  adapter: string;
  leads: Lead[];
  warning?: string;
  mode: "demo" | "live" | "fallback";
};

export interface LeadSourceAdapter {
  name: string;
  scan(query: ScanQuery): Promise<SourceResult>;
}
