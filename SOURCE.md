# ダレウリ — Full Source Dump (for AI review)

Generated from https://github.com/imashuku/dareuri.

## `README.md`

```md
# ダレウリ

**ポチる前に、販売元を3秒チェック。**

Amazonで見落としがちな「販売元」を、購入前に確認するためのWebアプリです。日経新聞の報道（偽装USBメモリの流通・出品審査の課題）を受けて、生活者が販売元情報を自分で確認する行動を支援するために作られました。

## 何をするツールか

1. Amazon上での「販売元情報の見方」を手順ガイドとして案内する
2. ユーザーが貼り付けた販売元情報テキストを整理・構造化する
3. 販売元の透明性・商品カテゴリ注意度を3段階の確認レベルで判定する（🔴 要確認／🟡 追加確認／🟢 目立つ懸念なし）
4. AI講評文（3〜4文）を生成する（`ANTHROPIC_API_KEY` 設定時のみ。未設定でもルール判定は動作）

本ツールは購入前の確認ポイントを整理するものであり、商品の真贋・品質・性能・販売者の信用度を断定するものではありません。

## プライバシー設計

- **商品URLはサーバーに送信しません。** URLはブラウザ内でのみカテゴリ推定に使います
- **電話番号は扱いません。** 貼り付けテキスト内の電話番号らしき文字列は、送信前にブラウザ内で `[PHONE_REDACTED]` にマスクされます（サーバー側でも二重に検出・破棄）
- **Claude APIには匿名化した特徴量のみを渡します。** 個人名・住所・URL・セラーID・電話番号は送信しません
- **判定結果は保存しません。** ステートレスで動作し、DBを持ちません

## セットアップ

```bash
npm install
npm run dev   # http://localhost:3007
```

環境変数（`.env.local`）:

| 変数 | 必須 | 説明 |
|---|---|---|
| `ANTHROPIC_API_KEY` | 任意 | AI講評の生成に使用。未設定の場合はルール判定のみ |
| `CLAUDE_MODEL` | 任意 | 既定は `claude-haiku-4-5` |

## 構成

```
app/page.tsx                  1ページ完結のUI
app/api/check/route.ts        POST /api/check（URLは受け取らない）
lib/categoryGuess.ts          クライアント側カテゴリ推定
lib/parseSellerText.ts        貼り付けテキストの構造化・電話番号マスク
lib/rules.ts                  透明性×カテゴリ注意度のルール判定
lib/critique.ts               Claude APIによるAI講評（匿名化payload）
lib/types.ts                  型定義
components/                   Hero / ManualGuide / SellerTextForm / ResultCard / Disclaimer
```

## 既知の制約（MVP）

- `/api/check` のレート制限はサーバーレスインスタンス単位の簡易実装（10回/分/IP）。厳密な制限が必要になったら Upstash 等の外部ストアに移行する
- 判定結果はキャッシュしないため、同一テキストの再チェックごとにAI講評のAPIコストが発生する

## Phase 2 候補（MVPでは未実装）

- Amazonページの自動取得
- ブックマークレット
- Chrome拡張
- iOS共有シート
- 注意カテゴリDB
- 公式API / Creators APIで取得できる範囲の再調査
- 判定結果キャッシュ
- 問い合わせフォーム
```

## `ROADMAP.md`

```md
# ダレウリ ロードマップ（Phase 2）

方針: ダレウリは「AI診断ツール」ではなく**消費者教育** — 売る価値は「販売元を確認する習慣」。
すべての施策・コピーは「ネット通販では『誰が売っているか』まで確認していますか？」を軸にする。
偽装USB報道は「開発のきっかけ」として控えめに触れるに留める（ニュースの寿命に依存しない）。

## Phase 2-0: 共通基盤（✅ 完了 2026-07-10）

1. **プリフィル入口（URLフラグメント）** ✅ — `/#s=<販売元テキスト>&u=<商品URL>` で自動投入→自動チェック（`lib/prefill.ts`）。
   フラグメントはサーバーに送信されないため「サーバーログに残さない」設計を維持。読み取り後はアドレスバーからも消去。
2. **LPコピー修正** ✅ — ヒーローに「ネット通販では、『誰が売っているか』まで確認していますか？」を追加（習慣軸）。

## Phase 2-1: ブックマークレット ★★★★★（✅ 完了 2026-07-10）

- ✅ 商品ページのDOM（商品名/ブランド/出荷元/販売元）＋**セラープロフィールを同一オリジンfetch**して特商法ブロックまで自動取得し、`#s=`でダレウリを開く（`lib/bookmarklet.ts`）。貼り付け30秒→3秒。
- ✅ 導入ページ `/bookmarklet`（PC=ドラッグ登録、スマホ=コードコピー→ブックマークURL置換）。トップからリンク。
- ✅ 検証: 実Amazon商品ページ（VASTDIGI/FBA海外セラー）でE2E確認 — 特商法・運営責任者・CN住所まで取得し🔴判定、電話番号はマスク。
- 残タスク: 直販・国内セラーの商品ページでの実地確認（パターン追加）。

## Phase 2-3: iPhone共有シート ★★★★★（✅ 完了 2026-07-10）

- ✅ Safari共有シート →「Webページの内容を取得」+「JavaScriptを実行」で販売元情報を抽出 → `#s=` でダレウリを開き自動判定（`lib/shortcut.ts`）。
- ✅ 導入ページ `/shortcut`（作り方6ステップ＋コード/URLのコピーボタン）。トップからリンク。
- ✅ 実ページ検証: 商品ページ・セラープロフィール両方で抽出成功、プロフィールから🔴判定・電話番号マスクを確認。
- 残: 実機iPhoneでの動作確認（Playwrightでの検証は済）。iCloud共有リンクでの配布（本人が作成→リンクをページに追加）。

## Phase 2-2: Chrome拡張 ★★★★★（実装✅ 2026-07-10・審査提出待ち）

- ✅ Manifest V3、`extension/`。ツールバー1クリック→販売元情報＋セラープロフィール特商法ブロックを収集→新規タブでダレウリ判定。
- ✅ 権限は `activeTab`＋`scripting` のみ（ホスト権限・常駐スクリプトなし＝審査・プライバシー対応）。
- ✅ E2E検証済み（実Amazonページ→🔴要確認・特商法取得・電話番号マスク）。提出用zip生成手順は `extension/README.md`。
- ⏳ 残: Chromeデベロッパー登録（$5・ユーザー作業）→ Dashboard提出。掲載文言・権限説明はREADMEに準備済み。

## Phase 2-4: ブランド検索 ★★★★☆（設計完了 2026-07-10 → `docs/phase2-4-brand-check.md`）

- 調査実測: **Wikipedia API は認証不要・CORS許可済みで即使える**（VASTDIGI=0件／キオクシア=168件と判別力を確認）。
- **国税庁 法人番号API はアプリケーションID発行に1〜1.5か月** → 実装を待たず**今すぐ申請**する（無料・有効期限なし）。
- 設計判断: ブランドの知名度は品質と無関係なので、**確認レベルの加点・減点には使わない**。「ブランドを調べる」独立セクションとして材料を並べる（消費者教育の筋に合う）。
- 実装順: ①法人番号API申請（今日） ②Wikipedia＋J-PlatPat/法人番号検索リンクで `BrandCheck` を先行実装 ③ID到着後に登記照合を追加。

## 発信（Phase 2と並行）

| 施策 | タイミング |
|---|---|
| note記事（開発ストーリー・習慣軸） | LPコピー修正後すぐ |
| X投稿（note-to-tweet 3本セット） | note公開と同時 |
| Product Hunt | 英語版LPができてから（Phase 2完了後） |

## 実行スケジュール目安

- **Day 1**: 本番公開（済）／AI講評のAPIキー設定／2-0（プリフィル＋LPコピー）
- **Day 2**: 2-1 ブックマークレット＋導入ページ／note記事ドラフト
- **Day 3-4**: 2-2 Chrome拡張実装→審査提出 → 待ち時間に 2-3 iPhoneショートカット
- **審査待ち**: 2-4 ブランド検索の設計・法人番号API試作
- **拡張公開後**: X投稿第2弾・READMEに全入口を整理
```

## `package.json`

```json
{
  "name": "dareuri",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3007",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.110.0",
    "next": "16.2.10",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.10",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vitest": "^4.1.10"
  }
}
```

## `app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { Noto_Sans_JP, Shippori_Mincho } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

// ロゴ「ダレウリ」専用。UI見出しには使わない（見出しはNoto Sans JP太字）
const shipporiMincho = Shippori_Mincho({
  weight: ["700"],
  variable: "--font-shippori-mincho",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "ダレウリ｜ポチる前に、販売元を3秒チェック。",
  description:
    "Amazonで見落としがちな「販売元」を、購入前に確認するためのツールです。販売元情報を貼り付けるだけで、購入前の確認ポイントを整理します。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} ${shipporiMincho.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
```

## `app/page.tsx`

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Hero from "@/components/Hero";
import ManualGuide from "@/components/ManualGuide";
import SellerTextForm from "@/components/SellerTextForm";
import ResultCard from "@/components/ResultCard";
import { guessCategoryFromUrl } from "@/lib/categoryGuess";
import { redactPhoneLike } from "@/lib/parseSellerText";
import { parsePrefillHash } from "@/lib/prefill";
import type { CategoryRisk, CheckRequest, CheckResult } from "@/lib/types";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prefillText, setPrefillText] = useState<string | undefined>(undefined);
  const resultRef = useRef<HTMLDivElement>(null);
  const prefillDone = useRef(false);

  // The product URL stays in the browser — used only to guess the category.
  const categoryRisk: CategoryRisk = url ? guessCategoryFromUrl(url) : null;

  function scrollBehavior(): ScrollBehavior {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
  }

  async function runCheck(body: CheckRequest) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        throw new Error(`check_failed_${res.status}`);
      }
      setResult((await res.json()) as CheckResult);
      requestAnimationFrame(() =>
        resultRef.current?.scrollIntoView({
          behavior: scrollBehavior(),
          block: "start",
        }),
      );
    } catch {
      setError(
        "チェックに失敗しました。時間をおいてもう一度お試しください。",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCheck(sellerText: string, categoryOverride?: CategoryRisk) {
    // Phone-like strings are masked in the browser before anything is sent.
    const { text, found } = redactPhoneLike(sellerText);
    void runCheck({
      sellerText: text,
      categoryRisk: categoryOverride !== undefined ? categoryOverride : categoryRisk,
      hasPhoneLikeInfoFromClient: found,
    });
  }

  // Bookmarklet / share-sheet entry: #s=<seller text>&u=<product url>.
  // The fragment never reaches the server; it is read here, shown in the
  // form, checked automatically, and removed from the address bar.
  useEffect(() => {
    if (prefillDone.current) return;
    prefillDone.current = true;
    const { sellerText, url: prefillUrl } = parsePrefillHash(
      window.location.hash,
    );
    if (!sellerText) return;
    const { text: redacted } = redactPhoneLike(sellerText);
    setPrefillText(redacted);
    if (prefillUrl) setUrl(prefillUrl);
    handleCheck(
      sellerText,
      prefillUrl ? guessCategoryFromUrl(prefillUrl) : null,
    );
    window.history.replaceState(null, "", window.location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 w-full">
        <Hero />

        <SellerTextForm
          loading={loading}
          hasResult={result !== null}
          prefillText={prefillText}
          onCheck={handleCheck}
          onClear={() => {
            setResult(null);
            setError(null);
          }}
        />

        <section className="px-5 mb-10">
          <details className="max-w-xl mx-auto group">
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
              販売元情報の見つけ方を見る
            </summary>
            <ManualGuide
              url={url}
              onUrlChange={setUrl}
              categoryRisk={categoryRisk}
            />
          </details>
          <div className="max-w-xl mx-auto mt-4 flex flex-col gap-2">
            <Link
              href="/bookmarklet"
              className="text-sm font-medium text-primary-active hover:text-ink transition-colors"
            >
              ⚡ 貼り付け不要の1クリック版（ブックマークレット）はこちら
            </Link>
            <Link
              href="/shortcut"
              className="text-sm font-medium text-primary-active hover:text-ink transition-colors"
            >
              📱 iPhoneの共有シートから使う（ショートカット）はこちら
            </Link>
          </div>
        </section>

        {error && (
          <p className="px-5 max-w-xl mx-auto text-sm text-level-high-fg mb-8">
            {error}
          </p>
        )}

        {result && (
          <div ref={resultRef}>
            <ResultCard result={result} />
          </div>
        )}
      </main>

      <footer className="bg-surface-dark text-on-dark-soft px-5 py-8">
        <div className="max-w-xl mx-auto space-y-3">
          <p className="font-display font-bold text-on-dark">ダレウリ</p>
          <p className="text-xs leading-relaxed">
            本ツールは、Amazon上に表示される販売元情報を整理し、購入前の確認ポイントを示すものです。商品の真贋、品質、性能、販売者の信用度を断定するものではありません。最終的な購入判断は、販売元情報、レビュー、返品条件、Amazon上の表示内容を確認したうえで行ってください。
          </p>
          <p className="text-xs">
            <Link
              href="/privacy"
              className="text-on-dark-soft hover:text-on-dark transition-colors underline underline-offset-2"
            >
              プライバシーポリシー
            </Link>
          </p>
          <p className="text-xs">
            © {new Date().getFullYear()} ステップアウトマーケティング合同会社
          </p>
        </div>
      </footer>
    </div>
  );
}
```

## `app/globals.css`

```css
@import "tailwindcss";

:root {
  /* Claude Design tokens (~/.claude/design/claude/DESIGN.md) */
  --canvas: #faf9f5;
  --surface-soft: #f5f0e8;
  --surface-card: #efe9de;
  --surface-dark: #181715;
  --ink: #141413;
  --body: #3d3d3a;
  --muted: #6c6a64;
  --hairline: #e6dfd8;
  --primary: #cc785c;
  --primary-active: #a9583e;
  --on-primary: #ffffff;
  --on-dark: #faf9f5;
  --on-dark-soft: #a09d96;

  /* 確認レベル用の3色トークン（淡色bg + 濃色fgでコントラスト確保） */
  --level-high-bg: #fbe9e7;
  --level-high-fg: #8f2b22;
  --level-high-border: #c64545;
  --level-medium-bg: #faf3da;
  --level-medium-fg: #6f540a;
  --level-medium-border: #d4a017;
  --level-low-bg: #e7f3e9;
  --level-low-fg: #285f36;
  --level-low-border: #5db872;
}

@theme inline {
  --color-canvas: var(--canvas);
  --color-surface-soft: var(--surface-soft);
  --color-surface-card: var(--surface-card);
  --color-surface-dark: var(--surface-dark);
  --color-ink: var(--ink);
  --color-body: var(--body);
  --color-muted: var(--muted);
  --color-hairline: var(--hairline);
  --color-primary: var(--primary);
  --color-primary-active: var(--primary-active);
  --color-on-primary: var(--on-primary);
  --color-on-dark: var(--on-dark);
  --color-on-dark-soft: var(--on-dark-soft);
  --color-level-high-bg: var(--level-high-bg);
  --color-level-high-fg: var(--level-high-fg);
  --color-level-high-border: var(--level-high-border);
  --color-level-medium-bg: var(--level-medium-bg);
  --color-level-medium-fg: var(--level-medium-fg);
  --color-level-medium-border: var(--level-medium-border);
  --color-level-low-bg: var(--level-low-bg);
  --color-level-low-fg: var(--level-low-fg);
  --color-level-low-border: var(--level-low-border);
  --font-sans: var(--font-noto-sans-jp), "Hiragino Kaku Gothic ProN", sans-serif;
  /* font-display はロゴ「ダレウリ」専用。UI見出しには使わない */
  --font-display: var(--font-shippori-mincho), "Hiragino Mincho ProN", serif;
}

body {
  background: var(--canvas);
  color: var(--body);
  font-family: var(--font-sans);
}

/* 日本語見出しは意味単位で折る */
h1,
h2,
h3 {
  word-break: keep-all;
  overflow-wrap: anywhere;
  line-break: strict;
}

/* Tailwind v4 preflight はボタンを cursor: default にするため戻す */
button:not(:disabled) {
  cursor: pointer;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

## `app/privacy/page.tsx`

```tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー｜ダレウリ",
  description:
    "ダレウリおよびChrome拡張機能「ダレウリ — Amazon販売元チェック」における個人情報・利用者情報の取り扱いについて。",
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 w-full px-5 py-12">
        <div className="max-w-xl mx-auto">
          <p className="text-xs font-bold tracking-[0.2em] text-primary-active mb-3">
            PRIVACY POLICY
          </p>
          <h1 className="font-bold text-2xl text-ink mb-2">
            プライバシーポリシー
          </h1>
          <p className="text-sm text-muted mb-10">最終更新日: 2026年7月10日</p>

          <div className="space-y-8 text-sm text-body leading-relaxed">
            <section>
              <p>
                ステップアウトマーケティング合同会社（以下「当社」）は、当社が提供するウェブサービス「ダレウリ」（https://dareuri.app、以下「本サービス」）およびChrome拡張機能「ダレウリ
                — Amazon販売元チェック」（以下「本拡張機能」）における利用者情報の取り扱いを、以下のとおり定めます。
              </p>
            </section>

            <section>
              <h2 className="font-bold text-lg text-ink mb-3">
                1. 収集しない情報
              </h2>
              <p className="mb-3">
                本サービスおよび本拡張機能は、利用者を個人として識別できる情報を収集しません。具体的には、以下のいずれも収集・保存・第三者提供を行いません。
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>氏名、メールアドレス、住所、電話番号などの個人情報</li>
                <li>認証情報（ID・パスワード等）</li>
                <li>閲覧履歴、検索履歴、位置情報</li>
                <li>利用者を継続的に識別するための識別子</li>
              </ul>
              <p className="mt-3">
                本サービスは利用登録を必要とせず、データベースを持ちません。本拡張機能は、ブラウザのストレージを一切使用しません。
              </p>
            </section>

            <section>
              <h2 className="font-bold text-lg text-ink mb-3">
                2. 販売元情報の取り扱い
              </h2>
              <p className="mb-3">
                本サービスは、利用者が入力・貼り付けた販売元情報（Amazonの商品ページおよび販売元プロフィールに公開されている事業者情報）を、確認レベルの判定のためにサーバー上で一時的に処理します。処理結果は返信後に破棄され、サーバーに保存されることはありません。
              </p>
              <p className="mb-3">
                本拡張機能は、利用者がツールバーのアイコンをクリックした時点でのみ、表示中のAmazon商品ページから販売元情報を読み取ります。読み取った情報は本サービスをURLフラグメント（URLの「#」以降）で開くために使用します。URLフラグメントはブラウザの仕様上サーバーへ送信されないため、商品URLがサーバーのログに記録されることはありません。
              </p>
              <p>
                貼り付けられたテキストに電話番号と推定される文字列が含まれる場合、判定処理の前にブラウザ内で自動的にマスクされ、サーバーに送信されません。
              </p>
            </section>

            <section>
              <h2 className="font-bold text-lg text-ink mb-3">
                3. 外部サービスの利用
              </h2>
              <p>
                本サービスは、判定結果に添える講評文の生成のためAnthropic社のClaude
                APIを利用します。同APIには、国名・表記の種別・判定結果といった匿名化された特徴量のみを送信します。事業者名、個人名、住所、電話番号、商品URL、販売元の識別子を送信することはありません。
              </p>
            </section>

            <section>
              <h2 className="font-bold text-lg text-ink mb-3">
                4. アクセス情報
              </h2>
              <p>
                本サービスはホスティング事業者であるVercel
                Inc.のインフラ上で提供されており、同社によりIPアドレス等のアクセスログが記録される場合があります。これらはサービスの安定運用および不正利用防止のために利用され、当社が個人の特定に用いることはありません。
              </p>
            </section>

            <section>
              <h2 className="font-bold text-lg text-ink mb-3">
                5. Cookie等
              </h2>
              <p>
                本サービスおよび本拡張機能は、広告配信・行動追跡を目的としたCookieやトラッキング技術を使用しません。
              </p>
            </section>

            <section>
              <h2 className="font-bold text-lg text-ink mb-3">
                6. 本ポリシーの変更
              </h2>
              <p>
                本ポリシーを変更する場合は、本ページに変更後の内容を掲載します。
              </p>
            </section>

            <section>
              <h2 className="font-bold text-lg text-ink mb-3">
                7. お問い合わせ
              </h2>
              <p>
                ステップアウトマーケティング合同会社
                <br />
                メール: hiroaki.imashuku@step-out.jp
              </p>
            </section>
          </div>

          <p className="mt-12">
            <Link
              href="/"
              className="text-sm text-primary-active hover:text-ink transition-colors"
            >
              ← ダレウリに戻る
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
```

## `app/bookmarklet/page.tsx`

```tsx
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
```

## `app/shortcut/page.tsx`

```tsx
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
```

## `app/api/check/route.ts`

```ts
import { NextResponse } from 'next/server';
import { parseSellerText } from '@/lib/parseSellerText';
import { evaluate } from '@/lib/rules';
import { generateCritique } from '@/lib/critique';
import type { CheckRequest, CheckResult } from '@/lib/types';

const MAX_TEXT_LENGTH = 10_000;

// Best-effort per-instance rate limit to bound Claude API cost.
// Serverless instances each keep their own window, which is acceptable
// for an MVP; see README for the known limitation.
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 10_000) hits.clear();
  return false;
}

// Receives only pasted seller text (phone-redacted on the client) and
// client-derived hints. Product URLs are never accepted here, and this
// route never fetches anything from Amazon.
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  let body: CheckRequest;
  try {
    const parsed: unknown = await request.json();
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
    }
    body = parsed as CheckRequest;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const sellerText = typeof body.sellerText === 'string' ? body.sellerText : '';
  // Trust the one-tap "sold by Amazon" flag only when no text was pasted;
  // pasted text always speaks for itself (parse detects Amazon direct too).
  const soldByAmazon = body.soldByAmazon === true && sellerText.trim().length === 0;

  if (!sellerText.trim() && !soldByAmazon) {
    return NextResponse.json({ error: 'empty_input' }, { status: 400 });
  }
  if (sellerText.length > MAX_TEXT_LENGTH) {
    return NextResponse.json({ error: 'text_too_long' }, { status: 400 });
  }

  const categoryRisk =
    body.categoryRisk === 'storage_media' || body.categoryRisk === 'charger_battery'
      ? body.categoryRisk
      : null;

  const parsed = parseSellerText(sellerText, {
    soldByAmazon,
    categoryRisk,
    hasPhoneLikeInfoFromClient: body.hasPhoneLikeInfoFromClient === true,
  });

  const result: CheckResult = evaluate(parsed);

  // AI critique is best-effort: any failure (no API key, timeout, error)
  // falls back to the rule-based result alone.
  try {
    result.critique = await generateCritique(parsed, result);
  } catch {
    result.critique = undefined;
  }

  return NextResponse.json(result);
}
```

## `lib/types.ts`

```ts
export type Signal = 'high' | 'medium' | 'low';
export type CountryGuess = 'JP' | 'CN' | 'other' | 'unknown';
export type Presence = 'present' | 'not_found' | 'unknown';
export type CategoryRisk = 'storage_media' | 'charger_battery' | null;
export type NameScript = 'ja' | 'latin' | 'unknown';
export type NameLanguage = 'ja' | 'latin' | 'mixed' | 'unknown';

export interface CheckRequest {
  // sellerText is phone-redacted on the client before it is sent
  sellerText?: string;
  soldByAmazon?: boolean;
  categoryRisk?: CategoryRisk;
  hasPhoneLikeInfoFromClient?: boolean;
}

// Structured result of the pasted text. Server-side only; raw values
// (operatorName, address) are never sent to the Claude API.
export interface ParsedSellerInfo {
  storeName?: string;
  operatorName?: string;
  address?: string;
  countryGuess: CountryGuess;
  ratingCount?: number;
  ratingPercent?: number;
  hasSellerInfo: boolean;
  hasTokushohoLikeInfo: Presence;
  hasPhoneLikeInfo: Presence;
  soldByAmazon: boolean;
  shipsFromAmazon: boolean;
  storeNameLanguage?: NameLanguage;
  operatorNameScript?: NameScript;
  categoryRisk?: CategoryRisk;
}

export interface Flag {
  id: string;
  score: number;
  label: string;
  description: string;
}

export interface CheckResult {
  signal: Signal;
  flags: Flag[];
  facts: {
    storeName?: string;
    shipsFrom?: string;
    country?: string;
    operatorNameScript?: string;
    hasTokushoho: Presence;
    hasPhoneLikeInfo: Presence;
  };
  critique?: string;
}

// Anonymized feature vector for the Claude API. No personal names,
// addresses, URLs, seller IDs, or phone numbers.
export interface CritiquePayload {
  sellerCountry: CountryGuess;
  storeNameLanguage: NameLanguage;
  operatorNameScript: NameScript;
  hasSellerInfo: boolean;
  hasTokushohoLikeInfo: boolean;
  shipsFromAmazon: boolean;
  soldByAmazon: boolean;
  categoryRisk: CategoryRisk;
  signal: Signal;
  flags: string[];
}
```

## `lib/prefill.ts`

```ts
// Prefill entry point for the bookmarklet / share sheet / extension.
// Data arrives in the URL fragment (#s=<seller text>&u=<product url>),
// which the browser never sends to the server — the no-server-logs
// privacy design holds even for one-tap flows.

export interface PrefillData {
  sellerText?: string;
  url?: string;
}

const MAX_PREFILL_LENGTH = 10_000;

export function parsePrefillHash(hash: string): PrefillData {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!raw) return {};
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(raw);
  } catch {
    return {};
  }
  const sellerText = params.get('s')?.trim().slice(0, MAX_PREFILL_LENGTH);
  const url = params.get('u')?.trim();
  return {
    sellerText: sellerText || undefined,
    url: url || undefined,
  };
}
```

## `lib/bookmarklet.ts`

```ts
// Bookmarklet source. Runs on an Amazon product page: collects the
// offer block (出荷元/販売元), then fetches the seller profile page
// (same-origin on amazon.co.jp) to grab the 特定商取引法 block, and
// opens Dareuri with everything in the URL fragment (#s=...&u=...).
// The fragment never reaches the server, so the privacy design holds.

export const SITE_ORIGIN = 'https://dareuri.app';

export const BOOKMARKLET_CODE =
  `javascript:void(async()=>{try{` +
  `const q=s=>document.querySelector(s);` +
  `const t=e=>e?e.innerText.trim():'';` +
  `const p=[];` +
  `const title=t(q('#productTitle'));if(title)p.push('商品名: '+title);` +
  `const b=t(q('#bylineInfo'));if(b)p.push('ブランド表記: '+b);` +
  `const f=t(q('#fulfillerInfoFeature_feature_div'));if(f)p.push(f);` +
  `const m=t(q('#merchantInfoFeature_feature_div'));if(m)p.push(m);` +
  `const a=q('#sellerProfileTriggerId');` +
  `if(a)p.push('販売元: '+a.textContent.trim());` +
  `if(a&&a.getAttribute('href')){try{` +
  `const r=await fetch(new URL(a.getAttribute('href'),location.origin),{credentials:'include'});` +
  `const d=new DOMParser().parseFromString(await r.text(),'text/html');` +
  `const s=d.querySelector('#page-section-detail-seller-info')||d.querySelector('#seller-profile-container');` +
  `if(s)p.push(s.innerText.trim());` +
  `}catch(e){}}` +
  `const x=p.join('\\n').slice(0,9000);` +
  `if(!x){alert('Amazonの商品ページで実行してください');return}` +
  `open('${SITE_ORIGIN}/#s='+encodeURIComponent(x)+'&u='+encodeURIComponent(location.origin+location.pathname),'_blank')` +
  `}catch(e){alert('ダレウリ: 情報を取得できませんでした')}})()`;
```

## `lib/shortcut.ts`

```ts
// iOS ショートカット用の抽出スクリプト。
// Safari の共有シート →「Webページ上でJavaScriptを実行」で走る。
// 入力は「ショートカットの入力」を直接つなぐ。「Webページの内容を
// 取得」を挟むとリッチテキストになり型が合わずエラーになる（実機確認）。
//
// fetch は使わない（ショートカットのJSは非同期完了を待てないため）。
// URLエンコードまで済ませた完成URLを completion() で返し、「URLを開く」
// にそのまま渡す。こうしないと日本語・改行でURLが壊れる。
//
// 商品ページで実行した場合はセラープロフィールを辿れないので、
// 取れるのは出荷元・販売元まで（モバイルSafariでは商品名要素も
// 出ないことがある）。特商法ブロックまで欲しい場合は、Safari で
// 販売元プロフィールを開いてから実行する。実機で動作確認済み。

export const SHORTCUT_JS = `const q = (s) => document.querySelector(s);
const t = (e) => (e ? e.innerText.trim() : "");
const p = [];

// 商品ページ側
const title = t(q("#productTitle"));
if (title) p.push("商品名: " + title);
const byline = t(q("#bylineInfo"));
if (byline) p.push("ブランド表記: " + byline);
const ful = t(q("#fulfillerInfoFeature_feature_div"));
if (ful) p.push(ful);
const merch = t(q("#merchantInfoFeature_feature_div"));
if (merch) p.push(merch);
const seller = q("#sellerProfileTriggerId");
if (seller) p.push("販売元: " + seller.textContent.trim());

// 販売元プロフィールページ側（特定商取引法に基づく表記）
const sec =
  q("#page-section-detail-seller-info") || q("#seller-profile-container");
if (sec) p.push(t(sec));

const text = p.join("\\n").slice(0, 9000);
completion(
  "https://dareuri.app/#s=" +
    encodeURIComponent(text) +
    "&u=" +
    encodeURIComponent(location.origin + location.pathname)
);`;
```

## `lib/parseSellerText.ts`

```ts
import type {
  CategoryRisk,
  CountryGuess,
  NameLanguage,
  NameScript,
  ParsedSellerInfo,
  Presence,
} from './types';

export const PHONE_REDACTED = '[PHONE_REDACTED]';

// Sequences of 9+ digits with phone-style separators (or a leading +/0).
// Postal codes (7 digits in JP, 6 in CN) stay below the digit threshold.
const PHONE_LIKE = /(?:\+?\d{1,4}[-‐−ー–—.()（）\s]?){3,}\d{2,}/g;

// Replace phone-like strings so the raw number is never stored, displayed,
// logged, or sent to the Claude API. Returns whether anything was redacted.
export function redactPhoneLike(text: string): { text: string; found: boolean } {
  let found = false;
  const redacted = text.replace(PHONE_LIKE, (match) => {
    const digits = match.replace(/\D/g, '');
    if (digits.length < 9 || digits.length > 15) return match;
    found = true;
    return PHONE_REDACTED;
  });
  return { text: redacted, found };
}

const JP_PREF =
  /(東京都|北海道|(?:京都|大阪)府|(?:青森|岩手|宮城|秋田|山形|福島|茨城|栃木|群馬|埼玉|千葉|神奈川|新潟|富山|石川|福井|山梨|長野|岐阜|静岡|愛知|三重|滋賀|兵庫|奈良|和歌山|鳥取|島根|岡山|広島|山口|徳島|香川|愛媛|高知|福岡|佐賀|長崎|熊本|大分|宮崎|鹿児島|沖縄)県)/;

// 「日本語対応」「日本語可」のような接客文言は国の証拠にしない
const JP_EXPLICIT = /(\bJP\b|\bJapan\b|日本(?!語))/i;

// Standalone 市/村 must never count as a China signal — Japanese addresses
// use them too (横浜市, 〇〇村). Only explicit country markers, Chinese
// province-level names, and simplified-only division characters (县/镇,
// which do not appear in Japanese addresses) qualify.
const CN_HINT =
  /(\bCN\b|中国|China|中華人民共和国|[县镇]|(?:江西|広東|广东|浙江|江蘇|江苏|福建|湖南|湖北|河南|河北|山東|山东|広西|广西|安徽|四川|遼寧|辽宁|雲南|云南|貴州|贵州|陝西|陕西|甘粛|甘肃|黒竜江|黑龙江|海南|青海|吉林|山西)省|重慶市|重庆市|北京市|上海市|天津市|深圳|香港)/i;

const OTHER_COUNTRY_HINT =
  /(\b(?:US|USA|UK|GB|KR|TW|HK|SG|VN|TH|MY|PH|ID|IN|DE|FR|IT|ES|AU|CA)\b|United States|Korea|Taiwan|Vietnam|Thailand|Singapore)/;

const HAS_JA_CHARS = /[぀-ヿ一-鿿ｦ-ﾟ]/;
const LATIN_ONLY = /^[A-Za-z0-9 .,'&\-]+$/;

// Priority order: JP prefecture → CN → explicit JP → other → unknown.
// A prefecture is unambiguous, so it wins outright. A loose "日本" mention
// (e.g. 「日本国内配送」 appended by an overseas seller) must NOT override
// concrete CN evidence, so CN is checked before JP_EXPLICIT. When in doubt,
// prefer 'unknown' over misclassifying an address.
export function guessCountry(
  address: string | undefined,
  fullText: string,
): CountryGuess {
  const target = address || fullText;
  if (JP_PREF.test(target)) return 'JP';
  if (CN_HINT.test(target)) return 'CN';
  if (JP_EXPLICIT.test(target)) return 'JP';
  if (OTHER_COUNTRY_HINT.test(target)) return 'other';
  return 'unknown';
}

function nameLanguage(name: string | undefined): NameLanguage {
  if (!name) return 'unknown';
  const trimmed = name.trim();
  if (!trimmed) return 'unknown';
  const hasJa = HAS_JA_CHARS.test(trimmed);
  const hasLatin = /[A-Za-z]/.test(trimmed);
  if (hasJa && hasLatin) return 'mixed';
  if (hasJa) return 'ja';
  if (LATIN_ONLY.test(trimmed)) return 'latin';
  return 'unknown';
}

function nameScript(name: string | undefined): NameScript {
  if (!name) return 'unknown';
  const trimmed = name.trim();
  if (!trimmed) return 'unknown';
  if (HAS_JA_CHARS.test(trimmed)) return 'ja';
  if (LATIN_ONLY.test(trimmed)) return 'latin';
  return 'unknown';
}

function extractLabeled(text: string, label: RegExp): string | undefined {
  const match = text.match(label);
  const value = match?.[1]?.trim();
  return value && value.length > 0 ? value.slice(0, 120) : undefined;
}

// Address on the seller profile page spans multiple lines between the
// 住所 label and the next labeled row.
function extractAddress(text: string): string | undefined {
  const match = text.match(
    /住所[:：]?\s*([\s\S]{0,300}?)(?=(?:運営責任者|店舗名|正式名称|お問い合わせ|電話|購入者|評価|特定商取引|$))/,
  );
  const value = match?.[1]?.replace(/\s+/g, ' ').trim();
  return value && value.length > 1 ? value.slice(0, 200) : undefined;
}

const CATEGORY_KEYWORDS: Array<{ pattern: RegExp; risk: CategoryRisk }> = [
  {
    pattern: /(USB\s?メモリ|USBフラッシュ|フラッシュドライブ|SDカード|microSD|マイクロSD|TFカード|外付けSSD|flash\s?drive)/i,
    risk: 'storage_media',
  },
  {
    pattern: /(充電器|チャージャー|モバイルバッテリー|ACアダプタ|電源アダプタ|バッテリー|charger|power\s?bank)/i,
    risk: 'charger_battery',
  },
];

export function guessCategoryFromText(text: string): CategoryRisk {
  for (const { pattern, risk } of CATEGORY_KEYWORDS) {
    if (pattern.test(text)) return risk;
  }
  return null;
}

export function parseSellerText(
  rawText: string,
  options: {
    soldByAmazon?: boolean;
    categoryRisk?: CategoryRisk;
    hasPhoneLikeInfoFromClient?: boolean;
  } = {},
): ParsedSellerInfo {
  // Defense in depth: redact again server-side even though the client
  // already replaced phone-like strings before sending.
  const { text, found: phoneFoundServer } = redactPhoneLike(rawText);

  const storeName = extractLabeled(text, /店舗名[:：]?\s*(.+)/);
  const operatorName = extractLabeled(text, /運営責任者名?[:：]?\s*(.+)/);
  const businessName = extractLabeled(text, /(?:正式名称|販売業者)[:：]?\s*(.+)/);
  const address = extractAddress(text);

  const soldByAmazon =
    options.soldByAmazon === true ||
    /販売元[:：]?\s*Amazon(\.co\.jp|Japan)/i.test(text) ||
    /Amazon\.co\.jp\s*が販売/.test(text);

  const shipsFromAmazon =
    /出荷元[:：]?\s*Amazon/i.test(text) || /Amazon\s*(が|から)?\s*(出荷|発送)/.test(text);

  const hasSellerInfo = Boolean(storeName || operatorName || businessName || address);

  let hasTokushohoLikeInfo: Presence;
  if (/特定商取引法|特商法/.test(text) || (operatorName && address)) {
    hasTokushohoLikeInfo = 'present';
  } else if (hasSellerInfo) {
    // Some seller info was pasted but the statutory block is incomplete
    hasTokushohoLikeInfo = 'not_found';
  } else {
    hasTokushohoLikeInfo = 'unknown';
  }

  const phoneMentioned =
    text.includes(PHONE_REDACTED) ||
    phoneFoundServer ||
    options.hasPhoneLikeInfoFromClient === true;
  let hasPhoneLikeInfo: Presence;
  if (phoneMentioned) {
    hasPhoneLikeInfo = 'present';
  } else if (hasSellerInfo) {
    hasPhoneLikeInfo = 'not_found';
  } else {
    hasPhoneLikeInfo = 'unknown';
  }

  // Seller rating, e.g. 「過去12か月間で90%が肯定的」「評価: (1,234件)」
  const percentMatch = text.match(/(\d{1,3})\s*[%％]\s*が?\s*(?:肯定的|高評価)/);
  const countMatch = text.match(/[(（]?\s*([\d,]{1,10})\s*件?\s*の?評価/);
  const ratingPercent = percentMatch ? Number(percentMatch[1]) : undefined;
  const ratingCount = countMatch
    ? Number(countMatch[1].replace(/,/g, ''))
    : undefined;

  return {
    storeName: storeName ?? businessName,
    operatorName,
    address,
    countryGuess: guessCountry(address, text),
    ratingCount: Number.isFinite(ratingCount) ? ratingCount : undefined,
    ratingPercent: Number.isFinite(ratingPercent) ? ratingPercent : undefined,
    hasSellerInfo,
    hasTokushohoLikeInfo,
    hasPhoneLikeInfo,
    soldByAmazon,
    shipsFromAmazon,
    storeNameLanguage: nameLanguage(storeName ?? businessName),
    operatorNameScript: nameScript(operatorName),
    categoryRisk: options.categoryRisk ?? guessCategoryFromText(text),
  };
}
```

## `lib/rules.ts`

```ts
import type { CheckResult, Flag, ParsedSellerInfo, Signal } from './types';

// Scoring flags. Wording stays factual: the tool points out things to
// confirm before purchase and never asserts authenticity or quality.
const FLAG_DEFS = {
  insufficient_seller_info: {
    score: 3,
    label: '事業者情報が十分に確認できません',
    description:
      '貼り付けられたテキストから、店舗名・運営責任者・所在地などの事業者情報を読み取れませんでした。販売元プロフィールの「特定商取引法に基づく表記」を開いて、もう一度確認してみてください。',
  },
  no_tokushoho_like_info: {
    score: 3,
    label: '特定商取引法に相当する表示が見当たりません',
    description:
      '販売者情報としての確認材料が少ない状態です。事業者名・所在地・責任者名がそろっているかを、販売元プロフィールで確認することをおすすめします。',
  },
  seller_country_not_japan: {
    score: 1,
    label: '所在地は日本国外です',
    description: '返品・問い合わせ条件を購入前に確認してください。',
  },
  japanese_store_name_with_latin_operator: {
    score: 1,
    label: '店舗名は日本語ですが、責任者名はローマ字表記です',
    description:
      '店舗名と事業者情報の表記に違いがあります。所在地や正式な事業者名をあわせて確認してください。',
  },
  japanese_store_name_with_overseas_address: {
    score: 2,
    label: '店舗名は日本語ですが、所在地は日本国外です',
    description:
      '販売事業者がどこの国なのかを購入前に確認してください。',
  },
  fba_third_party: {
    score: 1,
    label: '出荷元はAmazonですが、販売元はサードパーティです',
    description:
      'Amazonの倉庫から届く商品でも、販売しているのはAmazon以外の事業者です。Amazon直販と混同しないよう、販売元の表示を確認してください。',
  },
  high_risk_category: {
    score: 1,
    label: '購入前の確認をおすすめするカテゴリの商品です',
    description:
      'USBメモリ・SDカード・充電器・バッテリーなどは、不具合があったときの損失が大きいカテゴリです。容量・規格・レビューを念入りに確認することをおすすめします。',
  },
  sold_by_amazon: {
    score: -3,
    label: '販売元はAmazon.co.jp（直販）です',
    description:
      'Amazon自身が販売する商品のため、販売元に関する目立つ懸念は相対的に少ないと考えられます。',
  },
  good_seller_rating: {
    score: -1,
    label: '店舗評価が十分に多く、高評価です',
    description:
      '一定件数以上の購入者評価があり、高い割合で肯定的に評価されています。',
  },
} as const;

type FlagId = keyof typeof FLAG_DEFS;

function makeFlag(id: FlagId): Flag {
  const def = FLAG_DEFS[id];
  return { id, score: def.score, label: def.label, description: def.description };
}

export function evaluate(parsed: ParsedSellerInfo): CheckResult {
  const flags: Flag[] = [];

  if (parsed.soldByAmazon) {
    flags.push(makeFlag('sold_by_amazon'));
  } else {
    // Missing info counts once: no seller info at all → insufficient only;
    // seller info present but statutory block missing → tokushoho flag only.
    if (!parsed.hasSellerInfo) {
      flags.push(makeFlag('insufficient_seller_info'));
    } else if (parsed.hasTokushohoLikeInfo !== 'present') {
      flags.push(makeFlag('no_tokushoho_like_info'));
    }
    if (parsed.countryGuess === 'CN' || parsed.countryGuess === 'other') {
      flags.push(makeFlag('seller_country_not_japan'));
    }
    if (
      parsed.storeNameLanguage === 'ja' &&
      parsed.operatorNameScript === 'latin'
    ) {
      flags.push(makeFlag('japanese_store_name_with_latin_operator'));
    }
    if (
      parsed.storeNameLanguage === 'ja' &&
      (parsed.countryGuess === 'CN' || parsed.countryGuess === 'other')
    ) {
      flags.push(makeFlag('japanese_store_name_with_overseas_address'));
    }
    if (parsed.shipsFromAmazon) {
      flags.push(makeFlag('fba_third_party'));
    }
    if (
      parsed.ratingCount !== undefined &&
      parsed.ratingPercent !== undefined &&
      parsed.ratingCount >= 100 &&
      parsed.ratingPercent >= 90
    ) {
      flags.push(makeFlag('good_seller_rating'));
    }
  }

  if (parsed.categoryRisk) {
    flags.push(makeFlag('high_risk_category'));
  }

  const score = flags.reduce((sum, flag) => sum + flag.score, 0);
  const signal: Signal = score >= 4 ? 'high' : score >= 2 ? 'medium' : 'low';

  return {
    signal,
    flags,
    facts: {
      storeName: parsed.soldByAmazon ? 'Amazon.co.jp' : parsed.storeName,
      shipsFrom: parsed.shipsFromAmazon
        ? 'Amazon'
        : parsed.soldByAmazon
          ? 'Amazon'
          : undefined,
      country: parsed.soldByAmazon ? '日本' : countryLabel(parsed.countryGuess),
      operatorNameScript: scriptLabel(parsed.operatorNameScript),
      hasTokushoho: parsed.soldByAmazon ? 'present' : parsed.hasTokushohoLikeInfo,
      hasPhoneLikeInfo: parsed.hasPhoneLikeInfo,
    },
  };
}

function countryLabel(guess: ParsedSellerInfo['countryGuess']): string | undefined {
  switch (guess) {
    case 'JP':
      return '日本';
    case 'CN':
      return '中国';
    case 'other':
      return '日本国外';
    default:
      return undefined;
  }
}

function scriptLabel(
  script: ParsedSellerInfo['operatorNameScript'],
): string | undefined {
  switch (script) {
    case 'ja':
      return '日本語表記';
    case 'latin':
      return 'ローマ字表記';
    default:
      return undefined;
  }
}
```

## `lib/critique.ts`

```ts
import Anthropic from '@anthropic-ai/sdk';
import type { CheckResult, CritiquePayload, ParsedSellerInfo } from './types';

const CLAUDE_MODEL = process.env.CLAUDE_MODEL ?? 'claude-haiku-4-5';
const TIMEOUT_MS = 5_000;
const MAX_CRITIQUE_LENGTH = 500;

// Post-generation gate: the system prompt forbids these terms, but LLM
// compliance is not guaranteed, so the output is checked mechanically too.
const FORBIDDEN_TERMS = [
  '偽物',
  '詐欺',
  '危険',
  '安全',
  '黒',
  '悪質',
  '本物保証',
  'STOP',
] as const;

function containsForbiddenTerm(text: string): boolean {
  return FORBIDDEN_TERMS.some((term) => text.includes(term));
}

// Returns the critique only if it passes every output check; otherwise
// undefined, and the UI falls back to the rule-based result alone.
export function sanitizeCritique(raw: string): string | undefined {
  const text = raw.trim();
  if (!text) return undefined;
  if (text.length > MAX_CRITIQUE_LENGTH) return undefined;
  if (containsForbiddenTerm(text)) return undefined;
  if (text.includes('```')) return undefined;
  if (text.startsWith('{') || text.startsWith('[')) return undefined;
  return text;
}

const SYSTEM_PROMPT = `あなたは「ダレウリ」というAmazon販売元チェックツールの講評担当です。
入力として、販売元情報から抽出した特徴量（JSON）を受け取ります。生活者向けの講評文を生成してください。

制約:
- 3〜4文。生活者向けの平易な日本語。
- 次の語を絶対に使わない: 偽物、詐欺、危険、安全、黒、悪質、本物保証、STOP
- 真贋・品質・信用度を断定しない。販売者を非難しない。
- あくまで「購入前の確認材料」の提示に徹する。
- 最後は、返品条件・レビュー・販売元情報の再確認を促す一文で締める。
- 講評文のみを出力する。前置きや見出しは不要。`;

// Only anonymized features are sent — no personal names, addresses, URLs,
// seller IDs, or phone numbers. Presence values are converted to booleans.
export function buildCritiquePayload(
  parsed: ParsedSellerInfo,
  result: CheckResult,
): CritiquePayload {
  return {
    sellerCountry: parsed.countryGuess,
    storeNameLanguage: parsed.storeNameLanguage ?? 'unknown',
    operatorNameScript: parsed.operatorNameScript ?? 'unknown',
    hasSellerInfo: parsed.hasSellerInfo,
    hasTokushohoLikeInfo: parsed.hasTokushohoLikeInfo === 'present',
    shipsFromAmazon: parsed.shipsFromAmazon,
    soldByAmazon: parsed.soldByAmazon,
    categoryRisk: parsed.categoryRisk ?? null,
    signal: result.signal,
    flags: result.flags.map((flag) => flag.id),
  };
}

export async function generateCritique(
  parsed: ParsedSellerInfo,
  result: CheckResult,
): Promise<string | undefined> {
  if (!process.env.ANTHROPIC_API_KEY) return undefined;

  const client = new Anthropic({ timeout: TIMEOUT_MS, maxRetries: 0 });
  const payload = buildCritiquePayload(parsed, result);

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 400,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: JSON.stringify(payload) }],
  });

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('');

  return sanitizeCritique(text);
}
```

## `lib/categoryGuess.ts`

```ts
import { guessCategoryFromText } from './parseSellerText';
import type { CategoryRisk } from './types';

// Client-side only: the product URL never leaves the browser.
// We decode the URL slug (Amazon product URLs embed the product name)
// and match category keywords locally.
export function guessCategoryFromUrl(url: string): CategoryRisk {
  try {
    const decoded = decodeURIComponent(url);
    return guessCategoryFromText(decoded);
  } catch {
    return guessCategoryFromText(url);
  }
}

export function isAmazonUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url.startsWith('http') ? url : `https://${url}`);
    return /(^|\.)(amazon\.(co\.jp|com)|amzn\.(asia|to))$/.test(hostname);
  } catch {
    return false;
  }
}
```

## `components/Hero.tsx`

```tsx
export default function Hero() {
  return (
    <section className="pt-14 pb-8 px-5 text-center">
      <p className="text-xs font-bold tracking-[0.2em] text-primary-active mb-3">
        AMAZON 販売元チェック
      </p>
      <h1 className="font-display font-bold text-4xl sm:text-5xl text-ink mb-4">
        ダレウリ
      </h1>
      <p className="font-bold text-lg sm:text-xl text-ink mb-3">
        <span className="inline-block">ポチる前に、</span>
        <span className="inline-block">販売元を3秒チェック。</span>
      </p>
      <p className="text-sm text-body max-w-md mx-auto leading-relaxed mb-2">
        <span className="inline-block">ネット通販では、</span>
        <span className="inline-block">「誰が売っているか」まで</span>
        <span className="inline-block">確認していますか？</span>
      </p>
      <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
        <span className="inline-block">Amazonで見落としがちな「販売元」を、</span>
        <span className="inline-block">購入前に確認するためのツールです。</span>
      </p>
    </section>
  );
}
```

## `components/ManualGuide.tsx`

```tsx
"use client";

import { isAmazonUrl } from "@/lib/categoryGuess";
import type { CategoryRisk } from "@/lib/types";

const STEPS = [
  {
    title: "商品ページの「販売元」を見る",
    detail:
      "購入ボタンの近くに小さく表示されています。「販売元 Amazon.co.jp」ならAmazonの直販で、このツールでのチェックは不要です。ここで確認完了です。",
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
      "事業者の正式名称・運営責任者・住所が載っています。この部分をコピーして、上の欄に貼り付けてください。",
  },
];

const CATEGORY_NOTES: Record<Exclude<CategoryRisk, null>, string> = {
  storage_media:
    "USBメモリ・SDカードは、容量表示と実際の容量が異なる商品の報告が多いカテゴリです。販売元の確認を特におすすめします。",
  charger_battery:
    "充電器・バッテリーは、不具合があったときの影響が大きいカテゴリです。販売元の確認を特におすすめします。",
};

type Props = {
  url: string;
  onUrlChange: (url: string) => void;
  categoryRisk: CategoryRisk;
};

export default function ManualGuide({ url, onUrlChange, categoryRisk }: Props) {
  return (
    <div className="bg-surface-card rounded-xl p-6 sm:p-8 mt-3">
      <p className="text-xs text-muted mb-5">
        Amazonアプリ・ブラウザのどちらでも確認できます。
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
              <p className="text-sm font-medium text-ink">{step.title}</p>
              <p className="text-sm text-body leading-relaxed">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="border-t border-hairline pt-5">
        <label htmlFor="product-url" className="block text-sm font-medium text-ink mb-2">
          商品URL（任意）— 貼ると注意カテゴリをお知らせします
        </label>
        <input
          id="product-url"
          type="text"
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://www.amazon.co.jp/..."
          className="w-full h-11 px-4 rounded-lg border border-hairline bg-white text-ink text-base placeholder:text-muted/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <p className="text-xs text-muted/80 mt-2">
          <span className="inline-block">URLはブラウザ内でのみ使い、</span>
          <span className="inline-block">サーバーには送信しません。</span>
        </p>
        {url.trim().length > 0 && !isAmazonUrl(url) && (
          <p className="text-xs text-level-medium-fg mt-1">
            AmazonのURLではないようです。URLがなくても、そのまま確認手順は使えます。
          </p>
        )}
        {categoryRisk && (
          <p className="text-sm leading-relaxed bg-level-medium-bg text-level-medium-fg border border-level-medium-border/40 rounded-lg px-4 py-3 mt-3">
            {CATEGORY_NOTES[categoryRisk]}
          </p>
        )}
      </div>
    </div>
  );
}
```

## `components/SellerTextForm.tsx`

```tsx
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
```

## `components/ResultCard.tsx`

```tsx
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
        <h2 className="font-semibold text-lg text-ink mb-4">販売元情報の整理結果</h2>

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
```

## `components/Disclaimer.tsx`

```tsx
export default function Disclaimer() {
  return (
    <p className="text-xs text-muted leading-relaxed border-t border-hairline pt-4">
      本ツールは、Amazon上に表示される販売元情報を整理し、購入前の確認ポイントを示すものです。商品の真贋、品質、性能、販売者の信用度を断定するものではありません。最終的な購入判断は、販売元情報、レビュー、返品条件、Amazon上の表示内容を確認したうえで行ってください。
    </p>
  );
}
```

## `extension/manifest.json`

```json
{
  "manifest_version": 3,
  "name": "ダレウリ — Amazon販売元チェック",
  "version": "0.1.0",
  "description": "Amazonの商品ページで1クリック。販売元情報を自動で集めて、ダレウリの確認結果を開きます。",
  "action": {
    "default_title": "ダレウリでチェック",
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "background": {
    "service_worker": "background.js"
  },
  "permissions": ["activeTab", "scripting"],
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

## `extension/background.js`

```js
// ダレウリ Chrome拡張 — service worker
//
// 設計:
// - 常駐コンテンツスクリプトなし。ツールバーのボタンを押した瞬間だけ、
//   activeTab 権限で現在のタブに収集関数を注入する
// - 収集ロジックは lib/bookmarklet.ts と同一（実Amazonページで検証済み）
// - 収集結果は URL フラグメント (#s=...&u=...) でダレウリに渡す。
//   フラグメントはサーバーに送信されないため、販売元情報・商品URLが
//   サーバーログに残ることはない

const SITE_ORIGIN = "https://dareuri.app";

// タブ内で実行される収集関数。シリアライズされて注入されるため自己完結。
async function collectFromPage(siteOrigin) {
  try {
    if (!/(^|\.)amazon\.(co\.jp|com)$/.test(location.hostname)) {
      return { ok: false, message: "ダレウリ: Amazonの商品ページで押してください" };
    }
    const q = (s) => document.querySelector(s);
    const t = (e) => (e ? e.innerText.trim() : "");
    const p = [];
    const title = t(q("#productTitle"));
    if (title) p.push("商品名: " + title);
    const byline = t(q("#bylineInfo"));
    if (byline) p.push("ブランド表記: " + byline);
    const ful = t(q("#fulfillerInfoFeature_feature_div"));
    if (ful) p.push(ful);
    const merch = t(q("#merchantInfoFeature_feature_div"));
    if (merch) p.push(merch);
    const a = q("#sellerProfileTriggerId");
    if (a) p.push("販売元: " + a.textContent.trim());
    if (a && a.getAttribute("href")) {
      try {
        const r = await fetch(new URL(a.getAttribute("href"), location.origin), {
          credentials: "include",
        });
        const d = new DOMParser().parseFromString(await r.text(), "text/html");
        const sec =
          d.querySelector("#page-section-detail-seller-info") ||
          d.querySelector("#seller-profile-container");
        if (sec) p.push(sec.innerText.trim());
      } catch (e) {
        // セラーページ取得に失敗しても、商品ページ分だけでチェックできる
      }
    }
    const text = p.join("\n").slice(0, 9000);
    if (!text) {
      return {
        ok: false,
        message:
          "ダレウリ: 販売元情報が見つかりませんでした。商品ページで押してください",
      };
    }
    return {
      ok: true,
      url:
        siteOrigin +
        "/#s=" +
        encodeURIComponent(text) +
        "&u=" +
        encodeURIComponent(location.origin + location.pathname),
    };
  } catch (e) {
    return { ok: false, message: "ダレウリ: 情報を取得できませんでした" };
  }
}

async function runCheck(tab) {
  if (!tab || !tab.id) return;
  let result;
  try {
    const injected = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: collectFromPage,
      args: [SITE_ORIGIN],
    });
    result = injected && injected[0] ? injected[0].result : undefined;
  } catch (e) {
    // chrome:// 等、注入できないページでは何もしない
    return;
  }
  if (result && result.ok) {
    await chrome.tabs.create({ url: result.url, index: tab.index + 1 });
  } else {
    const message =
      (result && result.message) || "ダレウリ: 情報を取得できませんでした";
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (msg) => alert(msg),
        args: [message],
      });
    } catch (e) {
      // alertも出せないページなら諦める
    }
  }
}

chrome.action.onClicked.addListener((tab) => {
  runCheck(tab);
});

// テストから同じ経路を叩けるように公開（本番動作には影響しない）
self.__dareuriRunCheck = runCheck;
```

