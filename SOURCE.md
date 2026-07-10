# ポチマエ — Full Source Dump (for AI review)

Generated from https://github.com/imashuku/pochimae.

## `README.md`

```md
# ポチマエ

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
# ポチマエ ロードマップ（Phase 2）

方針: ポチマエは「AI診断ツール」ではなく**消費者教育** — 売る価値は「販売元を確認する習慣」。
すべての施策・コピーは「ネット通販では『誰が売っているか』まで確認していますか？」を軸にする。
偽装USB報道は「開発のきっかけ」として控えめに触れるに留める（ニュースの寿命に依存しない）。

## Phase 2-0: 共通基盤（最初に着手・全施策の土台）

1. **プリフィル入口（URLフラグメント）** — `https://pochimae.vercel.app/#s=<encodeURIComponent(販売元テキスト)>` を開くと
   貼り付け欄に自動投入→自動チェック。`#` フラグメントはサーバーに送信されないため「URL・テキストをサーバーログに残さない」設計を維持できる。
   ブックマークレット／iPhone共有シート／Chrome拡張の3つがすべてこの1本に乗る。
2. **LPコピー修正** — 事件前面→習慣軸へ。ヒーロー直下に「ネット通販では『誰が売っているか』まで確認していますか？」。

## Phase 2-1: ブックマークレット ★★★★★（審査不要・即日リリース可能）

- Amazon商品ページのDOMから販売元名・セラーID・出荷元を抽出し、`#s=` 付きでポチマエを開くJS。貼り付け30秒→3秒。
- 導入ページ `/bookmarklet` を新設（ドラッグ登録の手順、スマホSafariでの登録手順）。
- 検証: 実際のAmazon商品ページ（直販/FBA/海外セラー）3パターンで動作確認。

## Phase 2-3: iPhone共有シート ★★★★★（審査不要 — Chrome拡張より前倒し推奨）

- Appleショートカット1本: Safari共有シートでURLを受け取り→ポチマエを開く（まずはURL渡し＋確認手順ガイド表示で成立）。
- iCloudリンクで配布し、サイトに導入ボタンを設置。
- ※順番変更の理由: Chrome拡張はWebストア審査のリードタイム（数日〜）があるため、**拡張は早めに審査提出だけ済ませ、待ち時間にiOS対応を完了**させるのが効率的。

## Phase 2-2: Chrome拡張 ★★★★★（本命・審査あり）

- Manifest V3。商品ページで拡張アイコン→「販売元チェック」1クリック。
- content scriptがDOMから販売元情報（必要ならセラープロフィールも）を取得し、ポチマエの判定を表示。
- Chrome Webストア: デベロッパー登録（$5）→審査提出（数日〜2週間）。**実装完了次第すぐ提出**。
- コードは本リポジトリ `extension/` で管理。

## Phase 2-4: ブランド検索 ★★★★☆（AIではなく公開データの合わせ技）

- 入力: ブランド名 →
  1. Web検索: 公式サイトの実在
  2. Wikipedia: ブランドの知名度・沿革
  3. 商標: J-PlatPat検索リンクの自動生成（スクレイピングは規約上避ける）
  4. **国税庁 法人番号システムAPI**（無料・公式）: 会社の実在確認
- 結果は既存の確認レベルに加点・減点として統合。

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
  "name": "pochimae",
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

## `vitest.config.ts`

```ts
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname) },
  },
  test: {
    environment: 'node',
    include: ['**/__tests__/**/*.test.{ts,tsx}'],
  },
});
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

const shipporiMincho = Shippori_Mincho({
  weight: ["500", "700"],
  variable: "--font-shippori-mincho",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "ポチマエ｜ポチる前に、販売元を3秒チェック。",
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

import { useRef, useState } from "react";
import Hero from "@/components/Hero";
import ManualGuide from "@/components/ManualGuide";
import SellerTextForm from "@/components/SellerTextForm";
import ResultCard from "@/components/ResultCard";
import { guessCategoryFromUrl } from "@/lib/categoryGuess";
import { redactPhoneLike } from "@/lib/parseSellerText";
import type { CategoryRisk, CheckRequest, CheckResult } from "@/lib/types";

export default function Home() {
  const [url, setUrl] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const guideRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

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

  function handleCheck(sellerText: string) {
    // Phone-like strings are masked in the browser before anything is sent.
    const { text, found } = redactPhoneLike(sellerText);
    void runCheck({
      sellerText: text,
      categoryRisk,
      hasPhoneLikeInfoFromClient: found,
    });
  }

  function handleAmazonDirect() {
    void runCheck({ soldByAmazon: true, categoryRisk });
  }

  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 w-full">
        <Hero
          url={url}
          onUrlChange={setUrl}
          onShowGuide={() => {
            setShowGuide(true);
            requestAnimationFrame(() =>
              guideRef.current?.scrollIntoView({
                behavior: scrollBehavior(),
                block: "start",
              }),
            );
          }}
        />

        {showGuide && (
          <div ref={guideRef}>
            <ManualGuide categoryRisk={categoryRisk} />
          </div>
        )}

        <SellerTextForm
          loading={loading}
          onCheck={handleCheck}
          onAmazonDirect={handleAmazonDirect}
        />

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
          <p className="font-display text-on-dark">ポチマエ</p>
          <p className="text-xs leading-relaxed">
            本ツールは、Amazon上に表示される販売元情報を整理し、購入前の確認ポイントを示すものです。商品の真贋、品質、性能、販売者の信用度を断定するものではありません。最終的な購入判断は、販売元情報、レビュー、返品条件、Amazon上の表示内容を確認したうえで行ってください。
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
  const businessName = extractLabeled(text, /正式名称[:：]?\s*(.+)/);
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

const SYSTEM_PROMPT = `あなたは「ポチマエ」というAmazon販売元チェックツールの講評担当です。
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
```

## `components/ManualGuide.tsx`

```tsx
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
```

## `components/SellerTextForm.tsx`

```tsx
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
            disabled={loading}
            onClick={onAmazonDirect}
            className="h-11 px-6 rounded-lg bg-white border border-hairline text-ink text-sm font-medium hover:bg-surface-soft transition-colors disabled:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-active"
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

## `lib/__tests__/parseSellerText.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { guessCountry, parseSellerText } from '../parseSellerText';

describe('guessCountry', () => {
  it('classifies Japanese prefectures as JP', () => {
    expect(guessCountry('東京都港区', '')).toBe('JP');
    expect(guessCountry('大阪府大阪市', '')).toBe('JP');
    expect(guessCountry('滋賀県東近江市', '')).toBe('JP');
  });

  it('never classifies prefecture-less Japanese addresses as CN', () => {
    // 市/村 alone must not be treated as a China signal
    expect(['JP', 'unknown']).toContain(guessCountry('横浜市中区', ''));
    expect(['JP', 'unknown']).toContain(guessCountry('東近江市八日市', ''));
    expect(['JP', 'unknown']).toContain(guessCountry('八王子市', ''));
    expect(['JP', 'unknown']).toContain(guessCountry('〇〇村〇〇番地', ''));
  });

  it('classifies explicit Chinese addresses as CN', () => {
    expect(guessCountry('江西省吉安市', '')).toBe('CN');
    expect(guessCountry('深圳市, 广东省, CN', '')).toBe('CN');
    expect(guessCountry('吉水县八都镇', '')).toBe('CN');
  });

  it('classifies explicit JP markers as JP', () => {
    expect(guessCountry('中央区銀座1-2-3 Japan', '')).toBe('JP');
  });

  it('does not let a loose 日本 mention override CN evidence', () => {
    expect(
      guessCountry('吉水县八都镇坛上自然村10号 吉安市 江西 331600 CN 日本語対応可能', ''),
    ).toBe('CN');
    expect(guessCountry('中国 広東省深圳市 日本国内配送', '')).toBe('CN');
    // 「日本語」だけでは JP の証拠にならない
    expect(guessCountry('日本語対応スタッフ在籍', '')).toBe('unknown');
  });

  it('falls back to unknown when nothing matches', () => {
    expect(guessCountry('somewhere', '')).toBe('unknown');
  });
});

describe('parseSellerText country integration', () => {
  it('does not misclassify a Japanese seller as CN', () => {
    const parsed = parseSellerText(
      '店舗名: 東京デジタル\n住所: 横浜市中区1-2-3\n運営責任者名: John Smith',
    );
    expect(parsed.countryGuess).not.toBe('CN');
  });
});
```

## `lib/__tests__/rules.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { parseSellerText } from '../parseSellerText';
import { evaluate } from '../rules';

function flagIds(text: string) {
  const result = evaluate(parseSellerText(text));
  return { ids: result.flags.map((f) => f.id), signal: result.signal };
}

describe('evaluate — split store-name flags', () => {
  it('JA store name + latin operator + JP address: latin flag only, signal low', () => {
    const { ids, signal } = flagIds(
      '特定商取引法に基づく表記\n店舗名: 東京デジタル\n運営責任者名: John Smith\n住所: 東京都港区1-2-3',
    );
    expect(ids).toContain('japanese_store_name_with_latin_operator');
    expect(ids).not.toContain('japanese_store_name_with_overseas_address');
    expect(ids).not.toContain('seller_country_not_japan');
    expect(signal).toBe('low');
  });

  it('JA store name + latin operator + CN address: both flags, signal high', () => {
    const { ids, signal } = flagIds(
      '特定商取引法に基づく表記\n店舗名: 毎日上向き\n運営責任者名: zhiping liu\n住所: 江西省吉安市',
    );
    expect(ids).toContain('japanese_store_name_with_latin_operator');
    expect(ids).toContain('japanese_store_name_with_overseas_address');
    expect(signal).toBe('high');
  });

  it('VASTDIGI-style full paste stays high', () => {
    const { signal } = flagIds(
      '出荷元 Amazon\n販売元 毎日上向き\n特定商取引法に基づく表記\n店舗名: 毎日上向き\n住所:\n吉水县\n八都镇坛上自然村10号\n吉安市\n江西\n331600\nCN\n運営責任者名: zhiping liu',
    );
    expect(signal).toBe('high');
  });

  it('info-poor paste gets insufficient_seller_info only, signal medium', () => {
    const { ids, signal } = flagIds('なんだかよくわからないメモ書き');
    expect(ids).toEqual(['insufficient_seller_info']);
    expect(ids).not.toContain('no_tokushoho_like_info');
    expect(signal).toBe('medium');
  });

  it('seller info present but statutory block missing gets tokushoho flag only', () => {
    const { ids, signal } = flagIds('店舗名: 東京デジタル\n住所: 東京都港区1-2-3');
    expect(ids).toContain('no_tokushoho_like_info');
    expect(ids).not.toContain('insufficient_seller_info');
    expect(signal).toBe('medium');
  });

  it('removed legacy flag id is gone', () => {
    const { ids } = flagIds(
      '店舗名: 毎日上向き\n運営責任者名: zhiping liu\n住所: 江西省吉安市',
    );
    expect(ids).not.toContain('japanese_store_name_but_overseas_operator');
  });
});
```

## `lib/__tests__/critique.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { sanitizeCritique } from '../critique';

describe('sanitizeCritique', () => {
  it('returns a normal short critique as-is', () => {
    const text =
      '販売元の所在地が日本国外のため、返品や問い合わせの窓口を購入前に確認しておくとよさそうです。店舗名と責任者名の表記にも違いがあります。レビューや返品条件、販売元情報をもう一度確認したうえで判断してください。';
    expect(sanitizeCritique(text)).toBe(text);
  });

  it('rejects output containing forbidden terms', () => {
    expect(sanitizeCritique('この商品は偽物の可能性があります。')).toBeUndefined();
    expect(sanitizeCritique('この販売元は安全です。')).toBeUndefined();
    expect(sanitizeCritique('購入はSTOPしてください。')).toBeUndefined();
  });

  it('rejects output longer than 500 characters', () => {
    expect(sanitizeCritique('あ'.repeat(501))).toBeUndefined();
  });

  it('rejects empty output', () => {
    expect(sanitizeCritique('')).toBeUndefined();
    expect(sanitizeCritique('   ')).toBeUndefined();
  });

  it('rejects code blocks and JSON-looking output', () => {
    expect(sanitizeCritique('```json\n{"a":1}\n```')).toBeUndefined();
    expect(sanitizeCritique('{"signal":"high"}')).toBeUndefined();
    expect(sanitizeCritique('[{"signal":"high"}]')).toBeUndefined();
  });
});
```

## `components/__tests__/ResultCard.test.tsx`

```tsx
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import ResultCard from '../ResultCard';
import type { CheckResult } from '@/lib/types';

const result: CheckResult = {
  signal: 'medium',
  flags: [],
  facts: {
    storeName: '毎日上向き',
    shipsFrom: 'Amazon',
    country: '中国',
    operatorNameScript: 'ローマ字表記',
    hasTokushoho: 'present',
    hasPhoneLikeInfo: 'not_found',
  },
};

describe('ResultCard labels', () => {
  const html = renderToStaticMarkup(<ResultCard result={result} />);

  it('labels the country as an estimate', () => {
    expect(html).toContain('推定所在国');
    expect(html).not.toContain('>所在国<');
  });

  it('scopes business-info and phone labels to the pasted text', () => {
    expect(html).toContain('貼り付けテキスト内の事業者表示');
    expect(html).toContain('貼り付けテキスト内の電話番号表示');
  });

  it('shows the estimation note', () => {
    expect(html).toContain(
      '表示内容は、貼り付けられたテキストから機械的に整理・推定した結果です。',
    );
  });

  it('maps Presence values to あり/見当たらない', () => {
    expect(html).toContain('あり');
    expect(html).toContain('見当たらない');
  });
});
```

## `components/__tests__/Hero.test.tsx`

```tsx
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import Hero from '../Hero';
import { isAmazonUrl } from '@/lib/categoryGuess';

describe('Hero URL input', () => {
  const html = renderToStaticMarkup(
    <Hero url="" onUrlChange={() => {}} onShowGuide={() => {}} />,
  );

  it('does not rely on browser URL validation (type="text")', () => {
    // type="url" would block submitting protocol-less values like
    // amazon.co.jp/dp/xxxx via native form validation.
    expect(html).toContain('type="text"');
    expect(html).not.toContain('type="url"');
  });

  it('keeps URL-friendly input attributes', () => {
    expect(html).toContain('inputMode="url"');
    expect(html).toContain('autoCapitalize="none"');
    expect(html).toContain('spellCheck="false"');
  });
});

describe('isAmazonUrl accepts protocol-less Amazon URLs', () => {
  it('recognizes amazon.co.jp/dp/xxxx without a scheme', () => {
    expect(isAmazonUrl('amazon.co.jp/dp/B0H5HKHQSJ')).toBe(true);
    expect(isAmazonUrl('www.amazon.co.jp/dp/B0H5HKHQSJ')).toBe(true);
    expect(isAmazonUrl('https://www.amazon.co.jp/dp/B0H5HKHQSJ')).toBe(true);
  });

  it('rejects non-Amazon hosts', () => {
    expect(isAmazonUrl('example.com/dp/B0H5HKHQSJ')).toBe(false);
  });
});
```

