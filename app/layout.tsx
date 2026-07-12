import type { Metadata } from "next";
import { Noto_Sans_JP, Shippori_Mincho } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { BRAND_NAME, TAGLINE, SUB_COPY, SITE_ORIGIN } from "@/lib/brand";
import { structuredData } from "@/lib/structuredData";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

// ロゴ「ダレウリ」専用。UI見出しには使わない（見出しはNoto Sans JP太字）
const shipporiMincho = Shippori_Mincho({
  weight: ["700"],
  variable: "--font-shippori-mincho",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const SITE_TITLE = `${BRAND_NAME}｜${TAGLINE}`;
const SITE_DESCRIPTION =
  "Amazonで見落としがちな「販売元」を、購入前に確認するためのツールです。販売元情報を貼り付けるだけで、購入前の確認ポイントを整理します。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_ORIGIN,
    siteName: BRAND_NAME,
    type: "website",
    locale: "ja_JP",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: SUB_COPY }],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} ${shipporiMincho.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* AI検索・通常検索向けの構造化データ（WebSite / WebApplication / FAQPage） */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()) }}
        />
        {children}
        {/* Cookie不使用のアクセス計測。ダレウリのプライバシー方針と一致する。
            数値は Vercel ダッシュボードの Analytics タブで見る。 */}
        <Analytics />
      </body>
    </html>
  );
}
