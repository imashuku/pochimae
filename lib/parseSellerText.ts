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

const CN_HINT =
  /(\bCN\b|中国|China|中華人民共和国|[省市县鎮镇村]|(?:北京|上海|広東|广东|深圳|浙江|江蘇|江苏|福建|江西|湖南|湖北|河南|河北|山東|山东|広西|广西|安徽|四川|重慶|重庆|遼寧|辽宁|吉林|雲南|云南|貴州|贵州|陕西|山西|甘粛|甘肃|香港))/;

const OTHER_COUNTRY_HINT =
  /(\b(?:US|USA|UK|GB|KR|TW|HK|SG|VN|TH|MY|PH|ID|IN|DE|FR|IT|ES|AU|CA)\b|United States|Korea|Taiwan|Vietnam|Thailand|Singapore)/;

const HAS_JA_CHARS = /[぀-ヿ一-鿿ｦ-ﾟ]/;
const LATIN_ONLY = /^[A-Za-z0-9 .,'&\-]+$/;

function guessCountry(address: string | undefined, fullText: string): CountryGuess {
  const target = address || fullText;
  if (JP_PREF.test(target)) return 'JP';
  if (CN_HINT.test(target)) return 'CN';
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
