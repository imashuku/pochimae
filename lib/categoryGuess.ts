import { guessCategoryFromText } from './parseSellerText';
import type { CategoryRisk } from './types';

// Client-side only: the product URL never leaves the browser.
// We decode the URL slug (Amazon product URLs embed the product name)
// and match category keywords locally.
export function guessCategoryFromUrl(url: string): CategoryRisk {
  try {
    const decoded = decodeURIComponent(url);
    return guessCategoryFromText(decoded);
  } catch {
    return guessCategoryFromText(url);
  }
}

export function isAmazonUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url.startsWith('http') ? url : `https://${url}`);
    return /(^|\.)(amazon\.(co\.jp|com)|amzn\.(asia|to))$/.test(hostname);
  } catch {
    return false;
  }
}
