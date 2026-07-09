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
