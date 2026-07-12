// AI検索・通常検索に「これは何のツールか」を機械可読で伝える JSON-LD。
// 値は lib/brand.ts を単一の出所にする（名前・URLをここで二重に書かない）。
import { BRAND_NAME, TAGLINE, SITE_ORIGIN } from "@/lib/brand";

const PUBLISHER = {
  "@type": "Organization",
  name: "ステップアウトマーケティング合同会社",
  url: "https://www.step-out.jp",
  email: "hiroaki.imashuku@step-out.jp",
} as const;

const DESCRIPTION =
  "Amazonで見落としがちな「販売元（誰が売っているか）」を、購入前に3秒で確認するための無料ツール。販売元情報を貼り付けるか、ブックマークレット・iPhoneショートカット・Chrome拡張で自動収集すると、事業者情報の有無・所在国・特定商取引法に基づく表記などを整理し、購入前の確認ポイントを示します。";

// AIが最も引用しやすいFAQ形式。回答はブログ実装記録と同じ正確な文面を使う。
const FAQ: { q: string; a: string }[] = [
  {
    q: "ダレウリは何をするツールですか？",
    a: "Amazonの商品ページで見落としがちな「販売元（誰が売っているか）」を、買う前に確認するためのツールです。販売元情報を貼り付けるか、ブックマークレット・iPhoneショートカット・Chrome拡張で自動収集すると、事業者情報がそろっているか・所在地はどこか・特定商取引法の表記があるかなどを整理して見せます。真贋や品質を断定するものではなく、あくまで確認の材料を並べる消費者教育ツールです。",
  },
  {
    q: "料金はかかりますか？登録は必要ですか？",
    a: "無料で、登録も不要です。ブラウザで開いて、販売元情報を貼り付けるだけで使えます。",
  },
  {
    q: "貼り付けた販売元情報や商品URLは、サーバーに保存されますか？",
    a: "保存しません。商品URLはブラウザ内でカテゴリ推定にだけ使い、サーバーには送りません。ブックマークレットなどの自動入口は、情報をURLの#（フラグメント）に乗せて渡します。#以降はブラウザがサーバーに送信しない仕様なので、サーバーのログにも残りません。電話番号はブラウザ側でマスクし、AIには個人名・住所・URL・電話番号を除いた匿名の特徴量だけを渡しています。",
  },
  {
    q: "何を確認できますか？",
    a: "販売元の推定所在国が日本国外でないか、店舗名は日本語なのに責任者名がローマ字表記でないか、出荷元がAmazonでも販売元が別のサードパーティ事業者でないか、USBメモリや充電器など注意カテゴリの商品か、といった購入前の確認ポイントを整理して示します。",
  },
];

export function structuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_ORIGIN}/#website`,
        url: SITE_ORIGIN,
        name: BRAND_NAME,
        description: DESCRIPTION,
        inLanguage: "ja",
        publisher: PUBLISHER,
      },
      {
        "@type": "WebApplication",
        "@id": `${SITE_ORIGIN}/#app`,
        name: BRAND_NAME,
        alternateName: "DAREURI",
        url: SITE_ORIGIN,
        description: DESCRIPTION,
        applicationCategory: "SecurityApplication",
        operatingSystem: "Web",
        inLanguage: "ja",
        slogan: TAGLINE,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "JPY",
        },
        publisher: PUBLISHER,
        isAccessibleForFree: true,
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_ORIGIN}/#faq`,
        mainEntity: FAQ.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
    ],
  };
}
