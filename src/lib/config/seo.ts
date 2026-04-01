import type { Metadata } from "next";

import { productConfig } from "@/lib/config/product";

export function buildMetadata(overrides?: Partial<Metadata>): Metadata {
  return {
    title: productConfig.metaTitle,
    description: productConfig.metaDescription,
    metadataBase: new URL(`https://${productConfig.domainPlaceholder}`),
    openGraph: {
      title: productConfig.metaTitle,
      description: productConfig.metaDescription,
      siteName: productConfig.productName,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: productConfig.metaTitle,
      description: productConfig.metaDescription,
    },
    ...overrides,
  };
}
