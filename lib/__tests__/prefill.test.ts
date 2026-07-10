import { describe, expect, it } from 'vitest';
import { parsePrefillHash } from '../prefill';

describe('parsePrefillHash', () => {
  it('parses seller text and url from the fragment', () => {
    const text = '店舗名: 毎日上向き\n住所: 江西省吉安市';
    const url = 'https://www.amazon.co.jp/dp/B0H5HKHQSJ';
    const hash = `#s=${encodeURIComponent(text)}&u=${encodeURIComponent(url)}`;
    expect(parsePrefillHash(hash)).toEqual({ sellerText: text, url });
  });

  it('returns empty object for missing or empty hash', () => {
    expect(parsePrefillHash('')).toEqual({});
    expect(parsePrefillHash('#')).toEqual({});
    expect(parsePrefillHash('#foo=bar')).toEqual({
      sellerText: undefined,
      url: undefined,
    });
  });

  it('caps overly long seller text', () => {
    const hash = `#s=${encodeURIComponent('あ'.repeat(20000))}`;
    expect(parsePrefillHash(hash).sellerText?.length).toBe(10000);
  });

  it('works without the leading #', () => {
    expect(parsePrefillHash('s=hello')).toEqual({
      sellerText: 'hello',
      url: undefined,
    });
  });
});
