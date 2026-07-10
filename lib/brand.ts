// ブランド名とサイトURLの単一の出所。
// ここ以外にリテラルを書かないこと（extension/background.js だけは拡張の制約で
// import できないため、値を手で合わせる必要がある）。
export const BRAND_NAME = 'ダレウリ';
export const TAGLINE = 'ポチる前に、販売元を3秒チェック。';
export const SUB_COPY = 'その商品、ダレが売ってる？';

// 独自ドメイン。Vercel側で本番に割り当てるまでは、旧 *.vercel.app も並行して生きる。
export const SITE_ORIGIN = 'https://dareuri.app';
