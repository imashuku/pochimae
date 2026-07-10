"use client";

import { useEffect, useState } from "react";

type Props = {
  loading: boolean;
  hasResult: boolean;
  prefillText?: string;
  onCheck: (sellerText: string) => void;
  onClear: () => void;
};

export default function SellerTextForm({
  loading,
  hasResult,
  prefillText,
  onCheck,
  onClear,
}: Props) {
  const [text, setText] = useState("");

  // Bookmarklet / share-sheet entry: show the received text in the box
  // so the user sees exactly what is being checked.
  useEffect(() => {
    if (prefillText) setText(prefillText);
  }, [prefillText]);

  return (
    <section className="px-5 mb-6">
      <div className="max-w-xl mx-auto">
        <h2 className="font-bold text-xl text-ink text-center mb-4">
          <span className="inline-block">その商品、</span>
          <span className="inline-block">ダレが売ってる？</span>
        </h2>
        <label htmlFor="seller-text" className="block text-sm font-medium text-ink mb-2">
          Amazonの販売元情報を貼り付けてください
        </label>
        <textarea
          id="seller-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          placeholder="店舗名、運営責任者、所在地、評価情報などが含まれる部分を貼り付けてください"
          className="w-full rounded-lg border border-hairline bg-white text-ink text-base p-4 leading-relaxed placeholder:text-muted/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <div className="flex flex-col sm:flex-row gap-3 mt-3">
          <button
            type="button"
            disabled={loading || text.trim().length === 0}
            onClick={() => onCheck(text)}
            className="h-11 px-6 rounded-lg bg-primary text-on-primary text-sm font-medium hover:bg-primary-active transition-colors disabled:bg-hairline disabled:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-active"
          >
            {loading ? "チェック中…" : "この販売元情報をチェック"}
          </button>
          <button
            type="button"
            disabled={loading || (text.trim().length === 0 && !hasResult)}
            onClick={() => {
              setText("");
              onClear();
            }}
            className="h-11 px-4 rounded-lg text-muted text-sm font-medium hover:text-ink hover:bg-surface-soft transition-colors disabled:text-muted/40 disabled:hover:bg-transparent sm:ml-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-active"
          >
            クリア
          </button>
        </div>
        <p className="text-xs text-muted/80 mt-2">
          電話番号らしき文字列は、送信前にブラウザ内で自動的にマスクされます。
        </p>
      </div>
    </section>
  );
}
