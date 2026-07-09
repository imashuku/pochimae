import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import Hero from '../Hero';
import { isAmazonUrl } from '@/lib/categoryGuess';

describe('Hero URL input', () => {
  const html = renderToStaticMarkup(
    <Hero url="" onUrlChange={() => {}} onShowGuide={() => {}} />,
  );

  it('does not rely on browser URL validation (type="text")', () => {
    // type="url" would block submitting protocol-less values like
    // amazon.co.jp/dp/xxxx via native form validation.
    expect(html).toContain('type="text"');
    expect(html).not.toContain('type="url"');
  });

  it('keeps URL-friendly input attributes', () => {
    expect(html).toContain('inputMode="url"');
    expect(html).toContain('autoCapitalize="none"');
    expect(html).toContain('spellCheck="false"');
  });
});

describe('isAmazonUrl accepts protocol-less Amazon URLs', () => {
  it('recognizes amazon.co.jp/dp/xxxx without a scheme', () => {
    expect(isAmazonUrl('amazon.co.jp/dp/B0H5HKHQSJ')).toBe(true);
    expect(isAmazonUrl('www.amazon.co.jp/dp/B0H5HKHQSJ')).toBe(true);
    expect(isAmazonUrl('https://www.amazon.co.jp/dp/B0H5HKHQSJ')).toBe(true);
  });

  it('rejects non-Amazon hosts', () => {
    expect(isAmazonUrl('example.com/dp/B0H5HKHQSJ')).toBe(false);
  });
});
