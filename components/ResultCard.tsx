import type { CheckResult, Presence, Signal } from "@/lib/types";
import Disclaimer from "./Disclaimer";

// 判定は「色＋形＋文字」の三重符号化。アイコンは絵文字ではなくSVG
// （Heroicons outline）を使い、high=円+!、medium=三角+!、low=円+チェックで
// 形でも区別できるようにする。
const SIGNAL_ICON_PATHS: Record<Signal, string> = {
  high: "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z",
  medium:
    "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
  low: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

const SIGNAL_STYLES: Record<
  Signal,
  { label: string; note: string; className: string }
> = {
  high: {
    label: "要確認",
    note: "購入前に確認したい点が複数あります",
    className:
      "bg-level-high-bg text-level-high-fg border-level-high-border",
  },
  medium: {
    label: "追加確認",
    note: "購入前にもう一歩の確認をおすすめします",
    className:
      "bg-level-medium-bg text-level-medium-fg border-level-medium-border",
  },
  low: {
    label: "目立つ懸念なし",
    note: "販売元情報からは目立つ懸念は見つかりませんでした",
    className: "bg-level-low-bg text-level-low-fg border-level-low-border",
  },
};

function Icon({ path, className }: { path: string; className: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={path} />
    </svg>
  );
}

// 確認ポイント用: 加点フラグ=虫めがね、事実メモ=情報アイコン
const FLAG_CHECK_PATH =
  "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z";
const FLAG_INFO_PATH =
  "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z";

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
    ["推定所在国", result.facts.country ?? "不明"],
    ["責任者名の表記", result.facts.operatorNameScript ?? "不明"],
    ["貼り付けテキスト内の事業者表示", presenceLabel(result.facts.hasTokushoho)],
    ["貼り付けテキスト内の電話番号表示", presenceLabel(result.facts.hasPhoneLikeInfo)],
  ];

  return (
    <section className="px-5 mb-10" aria-live="polite">
      <div className="max-w-xl mx-auto bg-white border border-hairline rounded-xl p-6 sm:p-8">
        <h2 className="font-display text-lg text-ink mb-4">販売元情報の整理結果</h2>

        <div
          className={`flex items-center gap-3 border rounded-xl px-5 py-4 mb-6 ${signal.className}`}
        >
          <Icon
            path={SIGNAL_ICON_PATHS[result.signal]}
            className="w-9 h-9 shrink-0"
          />
          <div>
            <p className="text-xl font-bold leading-tight">{signal.label}</p>
            <p className="text-sm leading-snug mt-0.5">{signal.note}</p>
          </div>
        </div>

        <h3 className="text-sm font-medium text-ink mb-2">わかったこと</h3>
        <dl className="border border-hairline rounded-lg divide-y divide-hairline mb-2 text-sm">
          {facts.map(([label, value]) => (
            <div key={label} className="flex px-4 py-2.5 gap-3">
              <dt className="w-40 sm:w-60 shrink-0 text-muted">{label}</dt>
              <dd className="text-ink break-words min-w-0">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-muted mb-6">
          表示内容は、貼り付けられたテキストから機械的に整理・推定した結果です。
        </p>

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
                    <Icon
                      path={flag.score > 0 ? FLAG_CHECK_PATH : FLAG_INFO_PATH}
                      className="w-5 h-5 shrink-0 mt-0.5 text-primary-active"
                    />
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
