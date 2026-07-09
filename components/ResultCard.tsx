import type { CheckResult, Presence, Signal } from "@/lib/types";
import Disclaimer from "./Disclaimer";

const SIGNAL_STYLES: Record<
  Signal,
  { emoji: string; label: string; note: string; className: string }
> = {
  high: {
    emoji: "🔴",
    label: "要確認",
    note: "購入前に確認したい点が複数あります",
    className:
      "bg-level-high-bg text-level-high-fg border-level-high-border",
  },
  medium: {
    emoji: "🟡",
    label: "追加確認",
    note: "購入前にもう一歩の確認をおすすめします",
    className:
      "bg-level-medium-bg text-level-medium-fg border-level-medium-border",
  },
  low: {
    emoji: "🟢",
    label: "目立つ懸念なし",
    note: "販売元情報からは目立つ懸念は見つかりませんでした",
    className: "bg-level-low-bg text-level-low-fg border-level-low-border",
  },
};

function presenceLabel(value: Presence): string {
  switch (value) {
    case "present":
      return "あり";
    case "not_found":
      return "見当たらない";
    default:
      return "不明";
  }
}

type Props = {
  result: CheckResult;
};

export default function ResultCard({ result }: Props) {
  const signal = SIGNAL_STYLES[result.signal];
  const facts: Array<[string, string]> = [
    ["販売元名", result.facts.storeName ?? "不明"],
    ["出荷元", result.facts.shipsFrom ?? "不明"],
    ["所在国", result.facts.country ?? "不明"],
    ["責任者名の表記", result.facts.operatorNameScript ?? "不明"],
    ["特商法相当の表示", presenceLabel(result.facts.hasTokushoho)],
    ["電話番号表示", presenceLabel(result.facts.hasPhoneLikeInfo)],
  ];

  return (
    <section className="px-5 mb-10" aria-live="polite">
      <div className="max-w-xl mx-auto bg-white border border-hairline rounded-xl p-6 sm:p-8">
        <h2 className="font-display text-lg text-ink mb-4">販売元情報の整理結果</h2>

        <div
          className={`flex items-center gap-3 border rounded-xl px-5 py-4 mb-6 ${signal.className}`}
        >
          <span aria-hidden className="text-3xl leading-none">
            {signal.emoji}
          </span>
          <div>
            <p className="text-xl font-bold leading-tight">{signal.label}</p>
            <p className="text-sm leading-snug mt-0.5">{signal.note}</p>
          </div>
        </div>

        <h3 className="text-sm font-medium text-ink mb-2">わかったこと</h3>
        <dl className="border border-hairline rounded-lg divide-y divide-hairline mb-6 text-sm">
          {facts.map(([label, value]) => (
            <div key={label} className="flex px-4 py-2.5 gap-3">
              <dt className="w-36 shrink-0 text-muted">{label}</dt>
              <dd className="text-ink break-words min-w-0">{value}</dd>
            </div>
          ))}
        </dl>

        {result.flags.length > 0 && (
          <>
            <h3 className="text-sm font-medium text-ink mb-2">確認ポイント</h3>
            <ul className="space-y-3 mb-6">
              {result.flags.map((flag) => (
                <li
                  key={flag.id}
                  className="border border-hairline rounded-lg px-4 py-3"
                >
                  <p className="text-sm font-medium text-ink flex items-start gap-2">
                    <span aria-hidden className="mt-0.5">
                      {flag.score > 0 ? "☑️" : "🧾"}
                    </span>
                    {flag.label}
                  </p>
                  <p className="text-sm text-body leading-relaxed mt-1">
                    {flag.description}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}

        {result.critique && (
          <>
            <h3 className="text-sm font-medium text-ink mb-2">AIによる講評</h3>
            <p className="text-sm text-body leading-relaxed bg-surface-soft rounded-lg px-4 py-3 mb-6">
              {result.critique}
            </p>
          </>
        )}

        <Disclaimer />
      </div>
    </section>
  );
}
