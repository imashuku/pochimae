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
    label: '所在地が日本国外です',
    description:
      '海外セラーであること自体は問題ではありませんが、返品や問い合わせの際の窓口・条件を購入前に確認しておくと確実です。',
  },
  japanese_store_name_but_overseas_operator: {
    score: 2,
    label: '店舗名は日本語ですが、責任者名・所在地は海外です',
    description:
      '日本国内の事業者と誤認しやすい組み合わせです。どの国のどんな事業者が販売しているのかを、購入前にもう一度確認してみてください。',
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
    if (!parsed.hasSellerInfo) {
      flags.push(makeFlag('insufficient_seller_info'));
    }
    if (parsed.hasTokushohoLikeInfo !== 'present') {
      flags.push(makeFlag('no_tokushoho_like_info'));
    }
    if (parsed.countryGuess === 'CN' || parsed.countryGuess === 'other') {
      flags.push(makeFlag('seller_country_not_japan'));
    }
    if (
      parsed.storeNameLanguage === 'ja' &&
      (parsed.operatorNameScript === 'latin' ||
        parsed.countryGuess === 'CN' ||
        parsed.countryGuess === 'other')
    ) {
      flags.push(makeFlag('japanese_store_name_but_overseas_operator'));
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
