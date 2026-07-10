"use client";

import { useState } from "react";
import Link from "next/link";
import { SHORTCUT_JS } from "@/lib/shortcut";

const ICLOUD_LINK =
  "https://www.icloud.com/shortcuts/8b66461b45054b7abfc03e2f3ea50058";

// 実機（iOS 26）で確認した手順。アクションは3つだけ。
// 「Webページの内容を取得」は不要（リッチテキストを返すため
// 「JavaScriptを実行」に渡すと型が合わずエラーになる）。
const STEPS = [
  {
    title: "「ショートカット」アプリで新規ショートカットを作る",
    detail: "右上の＋を押して、新しいショートカットを作成します。",
  },
  {
    title: "「Webページ上でJavaScriptを実行」を追加",
    detail:
      "下部の検索欄で「JavaScript」と検索して追加します。「スクリプティングアクションが無効です」と出たら、その場の「設定を開く」から許可してください。",
  },
  {
    title: "下部の ⓘ ボタンから「共有シートに表示」をオン",
    detail:
      "画面下部中央の ⓘ をタップし、「共有シートに表示」をオンにします。これでワークフローの先頭に「共有シートから受け取る」の行が追加されます。",
  },
  {
    title: "コードを貼り付け、入力に「ショートカットの入力」を指定",
    detail:
      "サンプルコードを全部消して、下のコードを貼り付けます。「◯◯ に対してJavaScriptを実行」の◯◯部分をタップし、変数「ショートカットの入力」を選びます。",
  },
  {
    title: "「URLを開く」を追加",
    detail:
      "検索欄で「URLを開く」を追加し、URL欄に変数「JavaScriptの結果」を入れます。コード側で完成URLを組み立てるので、URLの直接入力は不要です。",
  },
  {
    title: "名前を「ダレウリでチェック」にして完了",
    detail:
      "アクションは全部で3つ（共有シートから受け取る／JavaScriptを実行／JavaScriptの結果を開く）になります。",
  },
];

export default function ShortcutPage() {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(SHORTCUT_JS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 w-full px-5 py-12">
        <div className="max-w-xl mx-auto">
          <p className="text-xs font-bold tracking-[0.2em] text-primary-active mb-3">
            DAREURI FOR IPHONE
          </p>
          <h1 className="font-bold text-2xl text-ink mb-3">
            <span className="inline-block">Safariの共有シートから、</span>
            <span className="inline-block">販売元チェック。</span>
          </h1>
          <p className="text-sm text-body leading-relaxed mb-8">
            <span className="inline-block">iPhoneのSafariでAmazonの販売元プロフィールを開き、</span>
            <span className="inline-block">共有ボタンから「ダレウリでチェック」を選ぶだけ。</span>
            <span className="inline-block">貼り付け作業は不要です。</span>
          </p>

          <div className="bg-surface-card rounded-xl p-6 sm:p-8 mb-6">
            <h2 className="font-bold text-lg text-ink mb-3">
              かんたん導入（推奨）
            </h2>
            <p className="text-sm text-body leading-relaxed mb-5">
              iPhoneでこのボタンを押すと、ショートカットアプリが開きます。内容を確認して「ショートカットを追加」を押せば導入完了です。
            </p>
            <a
              href={ICLOUD_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center h-11 px-6 rounded-lg bg-primary text-on-primary text-sm font-medium hover:bg-primary-active transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-active"
            >
              ショートカットを追加する
            </a>
            <p className="text-xs text-muted mt-3 leading-relaxed">
              iCloud経由で配布しています。初回実行時に「Safariの項目を共有することを許可しますか？」と聞かれるので「常に許可」を選ぶと、次回から確認なしで使えます。
            </p>
          </div>

          <div className="bg-level-medium-bg text-level-medium-fg border border-level-medium-border/40 rounded-xl px-5 py-4 mb-10">
            <p className="text-sm leading-relaxed">
              <strong>使いどころ</strong>
              <br />
              商品ページではなく、<strong>販売元プロフィール</strong>を開いた状態で実行してください。商品ページの「この商品は、○○が販売し…」の
              <strong>○○（販売元の名前）をタップ</strong>すると開きます。所在地・運営責任者まで読み取れます。
            </p>
          </div>

          <details className="group mb-8">
            <summary className="cursor-pointer list-none flex items-center gap-2 text-sm font-medium text-primary-active hover:text-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-active rounded">
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 transition-transform group-open:rotate-90"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
              自分で作りたい場合の手順を見る
            </summary>

            <div className="bg-surface-card rounded-xl p-6 sm:p-8 mt-3">
              <p className="text-xs text-muted mb-5">
                iOS 26の実機で確認した手順です。アクションは全部で3つだけです。
              </p>
              <ol className="space-y-4 mb-6">
                {STEPS.map((step, i) => (
                  <li key={step.title} className="flex gap-3">
                    <span
                      aria-hidden
                      className="shrink-0 w-6 h-6 rounded-full bg-primary-active text-on-primary text-xs font-bold flex items-center justify-center mt-0.5"
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {step.title}
                      </p>
                      <p className="text-sm text-body leading-relaxed">
                        {step.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="border-t border-hairline pt-5">
                <h3 className="text-sm font-medium text-ink mb-3">
                  手順4に貼り付けるコード
                </h3>
                <button
                  type="button"
                  onClick={copyCode}
                  className="h-11 px-6 rounded-lg bg-primary text-on-primary text-sm font-medium hover:bg-primary-active transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-active"
                >
                  {copied ? "コピーしました ✓" : "コードをコピー"}
                </button>
                <textarea
                  readOnly
                  value={SHORTCUT_JS}
                  rows={6}
                  aria-label="ショートカットに貼り付けるJavaScript"
                  onFocus={(e) => e.target.select()}
                  className="w-full mt-4 rounded-lg border border-hairline bg-white text-muted text-xs p-3 font-mono"
                />
              </div>
            </div>
          </details>

          <div className="border border-hairline rounded-xl p-5 mb-8">
            <h2 className="text-sm font-medium text-ink mb-2">プライバシー</h2>
            <p className="text-xs text-muted leading-relaxed">
              読み取った販売元情報はURLの「#」以降に載せて渡します。「#」以降はブラウザの仕様上サーバーへ送信されないため、販売元情報や商品URLがダレウリのサーバーログに残ることはありません。電話番号らしき文字列は、チェック前にブラウザ内で自動的にマスクされます。
            </p>
          </div>

          <Link
            href="/"
            className="text-sm text-primary-active hover:text-ink transition-colors"
          >
            ← ダレウリに戻る
          </Link>
        </div>
      </main>
    </div>
  );
}
