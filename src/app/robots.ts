import type { MetadataRoute } from "next";

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://tryopenclawai.com").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/checkout/", "/api/", "/auth/"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
