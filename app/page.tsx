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
          <p className="max-w-xl mx-auto mt-4">
            <Link
              href="/bookmarklet"
              className="text-sm font-medium text-primary-active hover:text-ink transition-colors"
            >
              ⚡ 貼り付け不要の1クリック版（ブックマークレット）はこちら
            </Link>
          </p>
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
          <p className="font-display font-bold text-on-dark">ポチマエ</p>
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
