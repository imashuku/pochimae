import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/brand";

// AI検索エンジン（ChatGPT / Perplexity / Claude / Google AI Overviews 等）に
// 明示的にクロールを許可する。暗黙の全許可より、個別に allow を示すほうが
// 「引用してよいサイト」であることを機械に伝えやすい（GEO対策）。
const AI_CRAWLERS = [
  "GPTBot", // OpenAI（ChatGPT Search）
  "ChatGPT-User", // OpenAI（ChatGPTのブラウズ）
  "OAI-SearchBot", // OpenAI（検索インデックス）
  "PerplexityBot", // Perplexity
  "Perplexity-User", // Perplexity（ユーザー起点の取得）
  "ClaudeBot", // Anthropic（Claude）
  "anthropic-ai", // Anthropic
  "Claude-Web", // Anthropic
  "Google-Extended", // Google（AI Overviews / Gemini）
  "Applebot-Extended", // Apple Intelligence
  "Bytespider", // ByteDance
  "cohere-ai", // Cohere
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // 通常の検索エンジンを含む全クローラーを許可
      { userAgent: "*", allow: "/" },
      // 主要AIクローラーを個別に明示許可
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
    host: SITE_ORIGIN,
  };
}
