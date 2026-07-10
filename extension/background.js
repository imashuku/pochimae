// ポチマエ Chrome拡張 — service worker
//
// 設計:
// - 常駐コンテンツスクリプトなし。ツールバーのボタンを押した瞬間だけ、
//   activeTab 権限で現在のタブに収集関数を注入する
// - 収集ロジックは lib/bookmarklet.ts と同一（実Amazonページで検証済み）
// - 収集結果は URL フラグメント (#s=...&u=...) でポチマエに渡す。
//   フラグメントはサーバーに送信されないため、販売元情報・商品URLが
//   サーバーログに残ることはない

const SITE_ORIGIN = "https://pochimae.vercel.app";

// タブ内で実行される収集関数。シリアライズされて注入されるため自己完結。
async function collectFromPage(siteOrigin) {
  try {
    if (!/(^|\.)amazon\.(co\.jp|com)$/.test(location.hostname)) {
      return { ok: false, message: "ポチマエ: Amazonの商品ページで押してください" };
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
          "ポチマエ: 販売元情報が見つかりませんでした。商品ページで押してください",
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
    return { ok: false, message: "ポチマエ: 情報を取得できませんでした" };
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
      (result && result.message) || "ポチマエ: 情報を取得できませんでした";
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
self.__pochimaeRunCheck = runCheck;
