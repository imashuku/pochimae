import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "iPhoneショートカットの作り方｜ダレウリ",
  description:
    "iPhoneのSafariの共有ボタンから、Amazonの販売元情報を集めてダレウリで確認するショートカットの作り方です。実機（iOS 26）で確認した3ステップの手順を掲載しています。",
  alternates: { canonical: "/shortcut" },
};

export default function ShortcutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
