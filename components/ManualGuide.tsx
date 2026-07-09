import type { CategoryRisk } from "@/lib/types";

const STEPS = [
  {
    title: "商品ページの「販売元」を見る",
    detail:
      "購入ボタンの近くに小さく表示されています。「販売元 Amazon.co.jp」なら直販です。",
  },
  {
    title: "「出荷元」も確認する",
    detail:
      "出荷元がAmazonでも、販売しているのは別の事業者のことがあります。2つはセットで見ます。",
  },
  {
    title: "販売元名のリンクをタップ",
    detail: "販売元の名前はリンクになっています。タップすると店舗情報が開きます。",
  },
  {
    title: "販売元プロフィールを開く",
    detail: "店舗の評価や「詳細情報」が表示されるページです。",
  },
  {
    title: "「特定商取引法に基づく表記」を見る",
    detail:
      "事業者の正式名称・運営責任者・住所が載っています。この部分をコピーして、下の欄に貼り付けてください。",
  },
];

const CATEGORY_NOTES: Record<Exclude<CategoryRisk, null>, string> = {
  storage_media:
    "USBメモリ・SDカードは、容量表示と実際の容量が異なる商品の報告が多いカテゴリです。販売元の確認を特におすすめします。",
  charger_battery:
    "充電器・バッテリーは、不具合があったときの影響が大きいカテゴリです。販売元の確認を特におすすめします。",
};

type Props = {
  categoryRisk: CategoryRisk;
};

export default function ManualGuide({ categoryRisk }: Props) {
  return (
    <section className="px-5 mb-8">
      <div className="max-w-xl mx-auto bg-surface-card rounded-xl p-6 sm:p-8">
        <h2 className="font-display text-lg text-ink mb-1">
          Amazonでの確認手順
        </h2>
        <p className="text-xs text-muted mb-5">
          Amazonアプリ・ブラウザのどちらでも確認できます。
        </p>
        {categoryRisk && (
          <p className="text-sm leading-relaxed bg-level-medium-bg text-level-medium-fg border border-level-medium-border/40 rounded-lg px-4 py-3 mb-5">
            {CATEGORY_NOTES[categoryRisk]}
          </p>
        )}
        <ol className="space-y-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span
                aria-hidden
                className="shrink-0 w-6 h-6 rounded-full bg-primary-active text-on-primary text-xs font-bold flex items-center justify-center mt-0.5"
              >
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{step.title}</p>
                <p className="text-sm text-body leading-relaxed">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
