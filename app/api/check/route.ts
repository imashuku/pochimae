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
