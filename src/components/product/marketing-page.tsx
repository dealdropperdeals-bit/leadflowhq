import { LandingShell } from "@/components/shared/landing/landing-shell";
import { productConfig } from "@/lib/config/product";

export function MarketingPage() {
  return <LandingShell config={productConfig} />;
}
