"use client";

import { isAmazonUrl } from "@/lib/categoryGuess";

type Props = {
  url: string;
  onUrlChange: (url: string) => void;
  onShowGuide: () => void;
};

export default function Hero({ url, onUrlChange, onShowGuide }: Props) {
  return (
    <section className="pt-14 pb-10 px-5 text-center">
      <p className="text-xs font-bold tracking-[0.2em] text-primary-active mb-3">
        AMAZON 販売元チェック
      </p>
      <h1 className="font-display text-4xl sm:text-5xl text-ink mb-4">
        ポチマエ
      </h1>
      <p className="font-display text-xl sm:text-2xl text-ink mb-3">
        <span className="inline-block">ポチる前に、</span>
        <span className="inline-block">販売元を3秒チェック。</span>
      </p>
      <p className="text-sm text-muted max-w-md mx-auto leading-relaxed mb-8">
        <span className="inline-block">Amazonで見落としがちな「販売元」を、</span>
        <span className="inline-block">購入前に確認するためのツールです。</span>
      </p>

      <div className="max-w-xl mx-auto">
        <h2 className="font-display text-lg text-ink mb-3">
          <span className="inline-block">その商品、</span>
          <span className="inline-block">ダレが売ってる？</span>
        </h2>
        <form
          className="flex flex-col sm:flex-row gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            onShowGuide();
          }}
        >
          <input
            type="text"
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="Amazonの商品URLを貼り付け（任意）"
            aria-label="Amazonの商品URL"
            className="flex-1 h-11 px-4 rounded-lg border border-hairline bg-white text-ink text-base placeholder:text-muted/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            className="h-11 px-6 rounded-lg bg-primary text-on-primary text-sm font-medium hover:bg-primary-active transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-active"
          >
            確認手順を見る
          </button>
        </form>
        <p className="text-xs text-muted/80 mt-2">
          <span className="inline-block">URLはブラウザ内でのみ使い、</span>
          <span className="inline-block">サーバーには送信しません。</span>
        </p>
        {url.trim().length > 0 && !isAmazonUrl(url) && (
          <p className="text-xs text-level-medium-fg mt-1">
            AmazonのURLではないようです。URLがなくても、そのまま確認手順は使えます。
          </p>
        )}
      </div>
    </section>
  );
}
