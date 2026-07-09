"use client";

import { useState } from "react";

type Props = {
  loading: boolean;
  onCheck: (sellerText: string) => void;
  onAmazonDirect: () => void;
};

export default function SellerTextForm({ loading, onCheck, onAmazonDirect }: Props) {
  const [text, setText] = useState("");

  return (
    <section className="px-5 mb-10">
      <div className="max-w-xl mx-auto">
        <label htmlFor="seller-text" className="block font-display text-lg text-ink mb-2">
          販売元情報を貼り付けてください
        </label>
        <textarea
          id="seller-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          placeholder="店舗名、運営責任者、所在地、評価情報などが含まれる部分を貼り付けてください"
          className="w-full rounded-lg border border-hairline bg-white text-ink text-sm p-4 leading-relaxed placeholder:text-muted/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <div className="flex flex-col sm:flex-row gap-3 mt-3">
          <button
            type="button"
            disabled={loading || text.trim().length === 0}
            onClick={() => onCheck(text)}
            className="h-11 px-6 rounded-lg bg-primary text-on-primary text-sm font-medium hover:bg-primary-active transition-colors disabled:bg-hairline disabled:text-muted"
          >
            {loading ? "チェック中…" : "この販売元情報をチェック"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onAmazonDirect}
            className="h-11 px-6 rounded-lg bg-white border border-hairline text-ink text-sm font-medium hover:bg-surface-soft transition-colors disabled:text-muted"
          >
            販売元はAmazon.co.jpでした
          </button>
        </div>
        <p className="text-xs text-muted/80 mt-2">
          電話番号らしき文字列は、送信前にブラウザ内で自動的にマスクされます。
        </p>
      </div>
    </section>
  );
}
