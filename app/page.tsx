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
