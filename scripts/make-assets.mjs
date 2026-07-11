// ブランド素材（拡張アイコン・ストア掲載画像・Xカード）をHTMLから生成する。
//
//   npm i -D playwright && node scripts/make-assets.mjs
//
// playwright はこのリポジトリの依存に入れていない（素材生成のときだけ要る）。
// 手作業で作ると、ブランド名を変えたときに作り直せなくなる（実際になった）。
// 素材はすべてここから再生成すること。
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// lib/brand.ts と値を合わせること
const BRAND = 'ダレウリ';
const BRAND_LATIN = 'DAREURI';
const INITIAL = 'ダ';
const SITE = 'dareuri.app';

const T = {
  canvas: '#faf9f5',
  ink: '#141413',
  body: '#3d3d3a',
  muted: '#6c6a64',
  hairline: '#e6dfd8',
  primary: '#cc785c',
  primaryActive: '#a9583e',
};
const SANS = '"Noto Sans JP","Hiragino Kaku Gothic ProN","Hiragino Sans",sans-serif';

const dataUri = (p) =>
  `data:image/png;base64,${readFileSync(resolve(ROOT, p)).toString('base64')}`;
const RESULT_CARD = dataUri('video/public/assets/03-result-card.png');

const page = (w, h, body) => `<!doctype html><meta charset="utf-8">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:${w}px;height:${h}px;background:${T.canvas};font-family:${SANS};
       display:flex;align-items:center;justify-content:center;overflow:hidden}
  /* カードは途中で切れる。行の途中で文字が半分残るとみっともないので、
     下端をフェードして「続きがある」ことを示す */
  .card{border-radius:14px;border:1px solid ${T.hairline};background:#fff;
        box-shadow:0 18px 44px rgba(20,20,19,.13);overflow:hidden;position:relative}
  .card img{display:block;width:100%}
  .card::after{content:"";position:absolute;left:0;right:0;bottom:0;height:90px;
        background:linear-gradient(to bottom,rgba(255,255,255,0),#fff)}
  .kicker{color:${T.primaryActive};font-weight:700;letter-spacing:.18em}
  .accent{color:${T.primary}}
</style>${body}`;

const shots = [
  {
    out: 'scripts/.tmp/icon.png',
    w: 512,
    h: 512,
    html: page(
      512,
      512,
      `<div style="width:512px;height:512px;background:${T.primary};border-radius:112px;
         display:flex;align-items:center;justify-content:center">
         <span style="color:#fff;font-weight:700;font-size:330px;line-height:1">${INITIAL}</span>
       </div>`,
    ),
  },
  {
    out: 'extension/store-assets/screenshot-1.png',
    w: 1280,
    h: 800,
    html: page(
      1280,
      800,
      `<div style="text-align:center;width:100%">
         <div class="kicker" style="font-size:15px">${BRAND_LATIN} — AMAZON 販売元チェック</div>
         <h1 style="font-size:44px;color:${T.ink};margin:22px 0 18px;letter-spacing:-.02em">
           Amazonの商品ページで、<span class="accent">1クリック</span>。</h1>
         <p style="font-size:18px;color:${T.body}">販売元・出荷元・特定商取引法に基づく表記を自動で集めて、確認結果を開きます。</p>
         <div style="display:flex;align-items:center;justify-content:center;gap:36px;margin-top:44px">
           <div>
             <div style="width:96px;height:96px;background:#fff;border-radius:22px;
                  box-shadow:0 8px 22px rgba(20,20,19,.12);display:flex;align-items:center;justify-content:center">
               <div style="width:68px;height:68px;background:${T.primary};border-radius:15px;
                    display:flex;align-items:center;justify-content:center">
                 <span style="color:#fff;font-weight:700;font-size:44px">${INITIAL}</span></div>
             </div>
             <div style="font-size:14px;font-weight:700;color:${T.ink};margin-top:14px">アイコンを押す</div>
           </div>
           <div style="font-size:34px;color:${T.primary}">➜</div>
           <div>
             <div class="card" style="width:556px;height:418px"><img src="${RESULT_CARD}"></div>
             <div style="font-size:14px;font-weight:700;color:${T.ink};margin-top:14px">確認結果が開く</div>
           </div>
         </div>
       </div>`,
    ),
  },
  {
    out: 'extension/store-assets/screenshot-2.png',
    w: 1280,
    h: 800,
    html: page(
      1280,
      800,
      `<div style="display:flex;align-items:center;gap:60px;padding:0 70px;width:100%">
         <div style="flex:1">
           <div class="kicker" style="font-size:15px">${BRAND_LATIN}</div>
           <h1 style="font-size:40px;color:${T.ink};margin:16px 0 20px;line-height:1.35;letter-spacing:-.02em">
             その商品、<br><span class="accent">ダレが売ってる？</span></h1>
           <p style="font-size:17px;color:${T.body};line-height:1.7;margin-bottom:26px">
             購入前に確認したいポイントを、<br>3段階の確認レベルで整理します。</p>
           <ul style="list-style:none;font-size:15px;color:${T.body};line-height:2.5">
             <li><span class="accent">●</span> <b style="color:${T.ink}">所在地</b>は日本国外ではないか</li>
             <li><span class="accent">●</span> 店舗名は日本語なのに、<b style="color:${T.ink}">責任者名はローマ字表記</b>ではないか</li>
             <li><span class="accent">●</span> 出荷元はAmazonでも、<b style="color:${T.ink}">販売元は別の事業者</b>ではないか</li>
             <li><span class="accent">●</span> USBメモリ・充電器など<b style="color:${T.ink}">注意カテゴリ</b>の商品か</li>
           </ul>
         </div>
         <div class="card" style="width:516px;height:660px"><img src="${RESULT_CARD}"></div>
       </div>`,
    ),
  },
  {
    // OGP画像。public/og.png として 1200x630 に縮小して配信する（下の縮小処理参照）。
    // タイムラインの小さい表示で勝負が決まるので、要素は「問い＋結果カードの実例＋URL」だけに絞る。
    out: 'scripts/.tmp/og.png',
    w: 2400,
    h: 1260,
    html: page(
      2400,
      1260,
      `<div style="display:flex;align-items:center;gap:100px;padding:0 130px;width:100%;height:100%">
         <div style="flex:1">
           <div class="kicker" style="font-size:28px">${BRAND_LATIN} — ${BRAND}</div>
           <h1 style="font-size:104px;color:${T.ink};margin:30px 0 36px;line-height:1.3;letter-spacing:-.02em">
             その商品、<br><span class="accent">ダレが売ってる？</span></h1>
           <p style="font-size:40px;color:${T.body};line-height:1.7">ポチる前に、販売元を<b style="color:${T.ink}">3秒</b>チェック。</p>
           <div style="display:flex;align-items:baseline;gap:30px;margin-top:56px">
             <div style="font-size:46px;font-weight:700;color:${T.ink}">${SITE}</div>
             <div style="font-size:30px;color:${T.muted}">無料・登録不要</div>
           </div>
         </div>
         <div class="card" style="width:880px;height:1040px"><img src="${RESULT_CARD}"></div>
       </div>`,
    ),
  },
  {
    out: 'scripts/.tmp/x-card.png',
    w: 2400,
    h: 1350,
    html: page(
      2400,
      1350,
      `<div style="display:flex;align-items:center;gap:110px;padding:0 120px;width:100%">
         <div style="flex:1">
           <div class="kicker" style="font-size:26px">${BRAND_LATIN} — ${BRAND}</div>
           <h1 style="font-size:76px;color:${T.ink};margin:26px 0 34px;line-height:1.35;letter-spacing:-.02em">
             その商品、<br><span class="accent">ダレが売ってる？</span></h1>
           <p style="font-size:32px;color:${T.body};line-height:1.75">
             Amazonの「販売元」を貼り付けるだけ。<br>
             所在国・責任者名の表記・出荷元を整理して、<br>
             購入前の確認ポイントを示します。</p>
           <div style="font-size:34px;font-weight:700;color:${T.ink};margin-top:44px">${SITE}</div>
         </div>
         <div class="card" style="width:1000px;height:1130px"><img src="${RESULT_CARD}"></div>
       </div>`,
    ),
  },
];

// 引数で対象を絞れる（例: node scripts/make-assets.mjs og）。無指定なら全部。
const only = process.argv[2];

const browser = await chromium.launch();
mkdirSync(resolve(ROOT, 'scripts/.tmp'), { recursive: true });

for (const s of shots) {
  if (only && !s.out.includes(only)) continue;
  const p = await browser.newPage({ viewport: { width: s.w, height: s.h } });
  await p.setContent(s.html, { waitUntil: 'networkidle' });
  await p.screenshot({ path: resolve(ROOT, s.out) });
  await p.close();
  console.log('✓', s.out);
}
await browser.close();

// OGP画像は2倍で撮ったものを 1200x630 に縮小して public/ へ（2400x1260 は正確に2倍なので歪まない）
if (!only || only === 'og') {
  writeFileSync(resolve(ROOT, 'public/og.png'), readFileSync(resolve(ROOT, 'scripts/.tmp/og.png')));
  execFileSync('sips', ['-z', '630', '1200', resolve(ROOT, 'public/og.png')], { stdio: 'ignore' });
  console.log('✓ public/og.png (1200x630)');
}

// 拡張アイコンは1枚の512pxから縮小して書き出す
if (!only || only === 'icon') {
  const icon = resolve(ROOT, 'scripts/.tmp/icon.png');
  for (const [size, out] of [
    [16, 'extension/icons/icon16.png'],
    [32, 'extension/icons/icon32.png'],
    [48, 'extension/icons/icon48.png'],
    [128, 'extension/icons/icon128.png'],
    [128, 'extension/store-assets/store-icon-128.png'],
  ]) {
    writeFileSync(resolve(ROOT, out), readFileSync(icon));
    execFileSync('sips', ['-z', String(size), String(size), resolve(ROOT, out)], {
      stdio: 'ignore',
    });
    console.log('✓', out, `(${size}px)`);
  }
}
