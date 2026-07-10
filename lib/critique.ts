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
