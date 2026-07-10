// Bookmarklet source. Runs on an Amazon product page: collects the
// offer block (出荷元/販売元), then fetches the seller profile page
// (same-origin on amazon.co.jp) to grab the 特定商取引法 block, and
// opens Pochimae with everything in the URL fragment (#s=...&u=...).
// The fragment never reaches the server, so the privacy design holds.

export const SITE_ORIGIN = 'https://pochimae.vercel.app';

export const BOOKMARKLET_CODE =
  `javascript:void(async()=>{try{` +
  `const q=s=>document.querySelector(s);` +
  `const t=e=>e?e.innerText.trim():'';` +
  `const p=[];` +
  `const title=t(q('#productTitle'));if(title)p.push('商品名: '+title);` +
  `const b=t(q('#bylineInfo'));if(b)p.push('ブランド表記: '+b);` +
  `const f=t(q('#fulfillerInfoFeature_feature_div'));if(f)p.push(f);` +
  `const m=t(q('#merchantInfoFeature_feature_div'));if(m)p.push(m);` +
  `const a=q('#sellerProfileTriggerId');` +
  `if(a)p.push('販売元: '+a.textContent.trim());` +
  `if(a&&a.getAttribute('href')){try{` +
  `const r=await fetch(new URL(a.getAttribute('href'),location.origin),{credentials:'include'});` +
  `const d=new DOMParser().parseFromString(await r.text(),'text/html');` +
  `const s=d.querySelector('#page-section-detail-seller-info')||d.querySelector('#seller-profile-container');` +
  `if(s)p.push(s.innerText.trim());` +
  `}catch(e){}}` +
  `const x=p.join('\\n').slice(0,9000);` +
  `if(!x){alert('Amazonの商品ページで実行してください');return}` +
  `open('${SITE_ORIGIN}/#s='+encodeURIComponent(x)+'&u='+encodeURIComponent(location.origin+location.pathname),'_blank')` +
  `}catch(e){alert('ポチマエ: 情報を取得できませんでした')}})()`;
