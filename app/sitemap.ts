import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/brand";

// 静的な4ページ。ページを増やしたらここに足す。
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_ORIGIN}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_ORIGIN}/bookmarklet`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_ORIGIN}/shortcut`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_ORIGIN}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
