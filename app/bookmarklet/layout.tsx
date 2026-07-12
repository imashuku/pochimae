import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ブックマークレットの使い方｜ダレウリ",
  description:
    "Amazonの商品ページで1クリックするだけで、販売元・出荷元・特定商取引法に基づく表記を自動で集めて、ダレウリの確認結果を開くブックマークレットの導入方法です。",
  alternates: { canonical: "/bookmarklet" },
};

export default function BookmarkletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
