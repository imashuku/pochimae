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
