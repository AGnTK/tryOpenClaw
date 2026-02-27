import type { MetadataRoute } from "next";

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://tryopenclawai.com").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/money-back-guarantee`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];
}
