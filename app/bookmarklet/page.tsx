"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BOOKMARKLET_CODE } from "@/lib/bookmarklet";

export default function BookmarkletPage() {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [copied, setCopied] = useState(false);

  // React blocks javascript: URLs in JSX, so the bookmarklet href is
  // assigned imperatively. The code itself is a static constant.
  useEffect(() => {
    linkRef.current?.setAttribute("href", BOOKMARKLET_CODE);
  }, []);

  async function copyCode() {
    await navigator.clipboard.writeText(BOOKMARKLET_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 w-full px-5 py-12">
        <div className="max-w-xl mx-auto">
          <p className="text-xs font-bold tracking-[0.2em] text-primary-active mb-3">
            DAREURI BOOKMARKLET
          </p>
          <h1 className="font-bold text-2xl text-ink mb-3">
            <span className="inline-block">1クリックで、</span>
            <span className="inline-block">販売元チェック。</span>
          </h1>
          <p className="text-sm text-body leading-relaxed mb-8">
            <span className="inline-block">Amazonの商品ページでこのブックマークを押すと、</span>
            <span className="inline-block">販売元情報を自動で集めて</span>
            <span className="inline-block">ダレウリのチェック結果を開きます。</span>
            <span className="inline-block">貼り付け作業は不要です。</span>
          </p>

          <div className="bg-surface-card rounded-xl p-6 sm:p-8 mb-6">
            <h2 className="font-bold text-lg text-ink mb-4">
              パソコンでの登録（ドラッグするだけ）
            </h2>
            <p className="text-sm text-body leading-relaxed mb-4">
              下のボタンを、ブラウザの<strong>ブックマークバーにドラッグ</strong>してください。
              あとはAmazonの商品ページで押すだけです。
            </p>
            <a
              ref={linkRef}
              onClick={(e) => e.preventDefault()}
              className="inline-block h-11 leading-[44px] px-6 rounded-lg bg-primary text-on-primary text-sm font-medium cursor-grab select-none"
              title="このボタンをブックマークバーへドラッグ"
            >
              ✓ ダレウリでチェック
            </a>
            <p className="text-xs text-muted mt-2">
              ※クリックしても動きません。ドラッグして登録してください。
            </p>
          </div>

          <div className="bg-surface-card rounded-xl p-6 sm:p-8 mb-6">
            <h2 className="font-bold text-lg text-ink mb-4">
              スマホ（Safari / Chrome）での登録
            </h2>
            <ol className="space-y-3 text-sm text-body leading-relaxed list-decimal list-inside mb-4">
              <li>下の「コードをコピー」を押す</li>
              <li>このページをいったんブックマークに追加する</li>
              <li>
                ブックマークの編集画面を開き、URL欄を
                <strong>コピーしたコードに置き換えて保存</strong>する
              </li>
              <li>Amazonの商品ページで、そのブックマークを開く</li>
            </ol>
            <button
              type="button"
              onClick={copyCode}
              className="h-11 px-6 rounded-lg bg-primary text-on-primary text-sm font-medium hover:bg-primary-active transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-active"
            >
              {copied ? "コピーしました ✓" : "コードをコピー"}
            </button>
            <textarea
              readOnly
              value={BOOKMARKLET_CODE}
              rows={4}
              aria-label="ブックマークレットのコード"
              onFocus={(e) => e.target.select()}
              className="w-full mt-4 rounded-lg border border-hairline bg-white text-muted text-xs p-3 font-mono break-all"
            />
          </div>

          <div className="border border-hairline rounded-xl p-5 mb-8">
            <h2 className="text-sm font-medium text-ink mb-2">プライバシー</h2>
            <p className="text-xs text-muted leading-relaxed">
              集めた販売元情報はURLの「#」以降に載せて渡します。「#」以降はブラウザの仕様上サーバーへ送信されないため、商品URLや販売元情報がダレウリのサーバーログに残ることはありません。電話番号らしき文字列は、チェック前にブラウザ内で自動的にマスクされます。
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
