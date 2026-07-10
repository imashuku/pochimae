import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import { FONT_SANS, FPS, SCENES, T, sceneFrames } from './theme';
import { Caption, Kicker, Rise, SceneFade, Shot, Sub, Title, Wordmark } from './parts';

const A = (n: string) => staticFile(`assets/${n}`);
const V = (n: number) => staticFile(`audio/scene-${String(n).padStart(2, '0')}.wav`);

const Stage: React.FC<{ children: React.ReactNode; dark?: boolean }> = ({
  children,
  dark,
}) => (
  <AbsoluteFill
    style={{
      background: dark ? T.surfaceDark : T.canvas,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {children}
  </AbsoluteFill>
);

// 1: 問い。
// 「ポチる」動作そのものを絵にする — カーソルが購入ボタンを押し、
// その真下にある「販売元」の行だけが最後まで見られない、という構図。
const S1: React.FC = () => {
  const frame = useCurrentFrame();
  // ボタン中央よりやや右下で止める（ラベル「今すぐ買う」に被せない）
  const cursorX = interpolate(frame, [46, 84], [250, 72], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cursorY = interpolate(frame, [46, 84], [190, 14], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // 押し込み
  const press = interpolate(frame, [86, 92, 100], [1, 0.955, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // クリックの波紋
  const ripple = interpolate(frame, [88, 116], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // 押したあとで「販売元」の行に目が落ちる
  const seller = interpolate(frame, [120, 144], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const metaRow: React.CSSProperties = {
    fontFamily: FONT_SANS,
    fontSize: 21,
    color: T.muted,
    display: 'flex',
    justifyContent: 'space-between',
  };

  return (
    <Stage>
      <div style={{ display: 'grid', gap: 52, justifyItems: 'center' }}>
        <div style={{ textAlign: 'center', display: 'grid', gap: 24 }}>
          <Rise>
            <Sub>ネット通販で、</Sub>
          </Rise>
          <Rise delay={12}>
            <Title size={72}>
              「誰が売っているか」まで
              <br />
              確認していますか？
            </Title>
          </Rise>
        </div>

        <Rise delay={30} distance={36}>
          <div
            style={{
              position: 'relative',
              width: 620,
              padding: '34px 36px 30px',
              background: '#ffffff',
              border: `1px solid ${T.hairline}`,
              borderRadius: 18,
              boxShadow: '0 22px 54px rgba(20,20,19,0.13)',
              display: 'grid',
              gap: 20,
            }}
          >
            <div
              style={{
                fontFamily: FONT_SANS,
                fontSize: 40,
                fontWeight: 800,
                color: T.ink,
                letterSpacing: '-0.02em',
              }}
            >
              ￥1,480
            </div>

            <div style={{ position: 'relative' }}>
              <div
                style={{
                  transform: `scale(${press})`,
                  transformOrigin: 'center',
                  background: T.primary,
                  color: T.onPrimary,
                  fontFamily: FONT_SANS,
                  fontSize: 28,
                  fontWeight: 700,
                  textAlign: 'center',
                  padding: '20px 0',
                  borderRadius: 999,
                }}
              >
                今すぐ買う
              </div>
              {/* クリックの波紋 */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: 120,
                  height: 120,
                  marginLeft: -60,
                  marginTop: -60,
                  borderRadius: 999,
                  border: `3px solid ${T.primary}`,
                  transform: `scale(${0.4 + ripple * 2.2})`,
                  opacity: (1 - ripple) * 0.75,
                }}
              />
            </div>

            <div style={{ display: 'grid', gap: 12, paddingTop: 4 }}>
              <div style={metaRow}>
                <span>出荷元</span>
                <span style={{ color: T.body }}>Amazon.co.jp</span>
              </div>
              <div
                style={{
                  ...metaRow,
                  position: 'relative',
                  padding: '8px 12px',
                  margin: '-8px -12px',
                  borderRadius: 10,
                  background: `rgba(204,120,92,${seller * 0.14})`,
                  outline: `2px solid rgba(204,120,92,${seller})`,
                }}
              >
                <span style={{ color: seller > 0.5 ? T.primaryActive : T.muted }}>
                  販売元
                </span>
                <span
                  style={{
                    color: seller > 0.5 ? T.primaryActive : T.body,
                    fontWeight: seller > 0.5 ? 700 : 400,
                  }}
                >
                  ？
                </span>
              </div>
            </div>

            {/* カーソル。ボタンの中心へ吸い込まれる */}
            <div
              style={{
                position: 'absolute',
                left: 310 + cursorX,
                top: 116 + cursorY,
                opacity: interpolate(frame, [40, 52], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
              }}
            >
              <svg width="34" height="34" viewBox="0 0 24 24">
                <path
                  d="M4 2 L4 19 L8.5 14.8 L11.4 21.3 L14.4 20 L11.5 13.6 L18 13.2 Z"
                  fill={T.ink}
                  stroke="#ffffff"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </Rise>
      </div>
    </Stage>
  );
};

// 2: 見落とされている販売元（実Amazon画面。「販売元」行にスポットを当てる）
const S2: React.FC = () => {
  const frame = useCurrentFrame();
  // 「販売元」の行に向かって寄る
  const scale = interpolate(frame, [40, 260], [1.0, 1.26], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // 枠は寄りが始まってから出す
  const ring = interpolate(frame, [110, 140], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <Stage>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 90,
          padding: '0 110px',
          marginBottom: 60,
        }}
      >
        <div style={{ width: 700, display: 'grid', gap: 26 }}>
          <Rise>
            <Title size={56} align="left">
              販売元は、
              <br />
              画面の隅に小さく。
            </Title>
          </Rise>
          <Rise delay={16}>
            <Sub align="left">
              そこを開いて
              <br />
              所在地まで確かめる人は、ほとんどいない。
            </Sub>
          </Rise>
        </div>
        <Rise delay={10} distance={40}>
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: '50% 52%',
            }}
          >
            <div style={{ position: 'relative' }}>
              <Shot src={A('amazon-buybox-crop.png')} width={560} fade={false} />
              {/* 「販売元 毎日上向き」の行を囲む */}
              <div
                style={{
                  position: 'absolute',
                  left: '6%',
                  top: '47%',
                  width: '78%',
                  height: '14%',
                  border: `3px solid ${T.primary}`,
                  borderRadius: 8,
                  opacity: ring,
                  boxShadow: `0 0 0 6px ${T.primary}22`,
                }}
              />
            </div>
          </div>
        </Rise>
      </div>
      <Caption>購入ボタンのすぐ下。ここを見たことがありますか</Caption>
    </Stage>
  );
};

// 3: 何が起きているか（容量偽装）
const S3: React.FC = () => {
  const frame = useCurrentFrame();
  // 「1TB」と表示されるが、実際は…
  // 表示1TBに対し、実際に入るのは200MBに満たない（＝表示の5000分の1以下）。
  // 面積比をそのまま描くと点になって見えないので、下限を残して「ほぼゼロ」を示す。
  const shrink = interpolate(frame, [50, 90], [1, 0.035], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const realOpacity = interpolate(frame, [82, 100], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <Stage>
      <div style={{ display: 'grid', gap: 46, justifyItems: 'center' }}>
        <Rise>
          <Title size={54}>
            容量を偽装したUSBメモリが、
            <br />
            通販で広く出回っています。
          </Title>
        </Rise>
        <Rise delay={20}>
          {/* 上端を揃える。ラベルの行数差で箱の底がずれると比較図として読めない */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 56 }}>
            {/* 表示上の容量 */}
            <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
              <div
                style={{
                  width: 200,
                  height: 160,
                  background: T.surfaceCard,
                  borderRadius: 12,
                  border: `1px solid ${T.hairline}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: FONT_SANS,
                  fontSize: 44,
                  fontWeight: 800,
                  color: T.ink,
                }}
              >
                1TB
              </div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 22, color: T.muted }}>
                画面の表示
              </div>
            </div>
            <div
              style={{
                fontFamily: FONT_SANS,
                fontSize: 40,
                color: T.primary,
                paddingTop: 60,
              }}
            >
              →
            </div>
            {/* 実際の容量（ほぼ消えるまで縮む） */}
            <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
              <div
                style={{
                  width: 200,
                  height: 160,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {/* 1TBの外形。実際の中身がどれだけ小さいかの比較枠 */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    border: `2px dashed ${T.hairline}`,
                    borderRadius: 12,
                  }}
                />
                <div
                  style={{
                    width: 200,
                    height: Math.max(6, 160 * shrink),
                    background: T.levelHighBg,
                    border: `2px solid ${T.levelHighBorder}`,
                    borderRadius: 6,
                    opacity: realOpacity,
                  }}
                />
              </div>
              <div
                style={{
                  display: 'grid',
                  gap: 4,
                  justifyItems: 'center',
                  opacity: realOpacity,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 22,
                    color: T.muted,
                  }}
                >
                  実際に使える容量
                </div>
                <div
                  style={{
                    whiteSpace: 'nowrap',
                    fontFamily: FONT_SANS,
                    fontSize: 32,
                    fontWeight: 800,
                    color: T.levelHighFg,
                  }}
                >
                  200MBも入らない
                </div>
              </div>
            </div>
          </div>
        </Rise>
      </div>
      <Caption>「1TB」と表示され、書き込みも正常に終わる — 実容量は表示の5000分の1以下</Caption>
    </Stage>
  );
};

// 4: なぜ作ったか（自衛隊・自治体）
const S4: React.FC = () => {
  const facts = [
    {
      big: '50台以上',
      lead: '陸上自衛隊',
      // 「約1年間」は単位表現。行末で「約1年 / 間」に割らせない
      note: (
        <>
          機密を扱う端末が、ウイルス入りの偽装品に
          <span style={{ whiteSpace: 'nowrap' }}>約1年間</span>
          つながれていた
        </>
      ),
    },
    {
      big: '全国調査へ',
      lead: '総務省',
      note: '自治体のUSB利用実態を調べる方向で検討',
    },
  ];
  return (
    <Stage dark>
      <div style={{ display: 'grid', gap: 44, justifyItems: 'center' }}>
        <Rise>
          <div
            style={{
              fontFamily: FONT_SANS,
              fontSize: 46,
              fontWeight: 800,
              color: T.onDark,
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            買う人の問題では、なかった。
          </div>
        </Rise>
        {/* 2枚のカードは高さも幅も揃える（説明文の行数差で崩さない） */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '560px 560px',
            gap: 34,
            alignItems: 'stretch',
          }}
        >
          {facts.map((f, i) => (
            <Rise
              key={f.big}
              delay={16 + i * 14}
              distance={34}
              style={{ height: '100%' }}
            >
              <div
                style={{
                  height: '100%',
                  boxSizing: 'border-box',
                  padding: '40px 38px',
                  borderRadius: 18,
                  border: `1px solid ${T.onDarkSoft}44`,
                  display: 'grid',
                  gridTemplateRows: 'auto auto 1fr',
                  gap: 14,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    color: T.primary,
                  }}
                >
                  {f.lead}
                </div>
                <div
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 54,
                    fontWeight: 800,
                    color: T.onDark,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {f.big}
                </div>
                <div
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 21,
                    color: T.onDarkSoft,
                    lineHeight: 1.6,
                    wordBreak: 'keep-all',
                  }}
                >
                  {f.note}
                </div>
              </div>
            </Rise>
          ))}
        </div>
        <Rise delay={52}>
          <div
            style={{
              fontFamily: FONT_SANS,
              fontSize: 26,
              color: T.onDarkSoft,
              textAlign: 'center',
            }}
          >
            だから、買う前に確かめる道具をつくりました。
          </div>
        </Rise>
      </div>
      <Caption onDark>出典: 日本経済新聞（2026年7月10日）ほか</Caption>
    </Stage>
  );
};

// 5: ブランド提示
const S5: React.FC = () => {
  const frame = useCurrentFrame();
  const line = interpolate(frame, [10, 34], [0, 460], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <Stage>
      <div style={{ display: 'grid', gap: 26, justifyItems: 'center' }}>
        <Rise>
          <Kicker>AMAZON 販売元チェック</Kicker>
        </Rise>
        <Rise delay={8}>
          <Wordmark size={116} />
        </Rise>
        <div style={{ height: 3, width: line, background: T.primary }} />
        <Rise delay={22}>
          <Title size={44}>ポチる前に、販売元を3秒チェック。</Title>
        </Rise>
      </div>
    </Stage>
  );
};

// 6: 貼り付ける
const S6: React.FC = () => (
  <Stage>
    <div style={{ display: 'grid', gap: 34, justifyItems: 'center' }}>
      <Rise>
        <Kicker>STEP 1</Kicker>
      </Rise>
      <Rise delay={6}>
        <Title size={54}>販売元情報を、貼り付けるだけ。</Title>
      </Rise>
      <Rise delay={16} distance={40}>
        <Shot src={A('02-pasted.png')} width={880} fade={false} />
      </Rise>
    </div>
    <Caption>「特定商取引法に基づく表記」をコピーして貼り付け</Caption>
  </Stage>
);

// 7: 何を見ているか（確認ポイント）
// lib/rules.ts の9つのフラグと1対1で対応させている。増やすときは両方直すこと。
const S7: React.FC = () => {
  const items = [
    '事業者情報が十分に読み取れるか',
    '特定商取引法に相当する表示があるか',
    '所在地は日本国外か',
    '店舗名は日本語なのに、責任者名はローマ字表記か',
    '店舗名は日本語なのに、所在地は日本国外か',
    '出荷元はAmazonでも、販売元は別の事業者か',
    '不具合時の影響が大きいカテゴリの商品か',
    '販売元はAmazon.co.jpの直販か',
    '店舗評価は十分な件数と割合があるか',
  ];
  return (
    <Stage>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 70,
          padding: '0 96px',
        }}
      >
        <div style={{ flex: 1, display: 'grid', gap: 22 }}>
          <Rise>
            <div style={{ display: 'grid', gap: 10 }}>
              <Kicker>STEP 1 — ルールで整理</Kicker>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 40,
                  fontWeight: 800,
                  color: T.ink,
                  letterSpacing: '-0.02em',
                }}
              >
                9つの観点を、機械的に。
              </div>
            </div>
          </Rise>
          <div style={{ display: 'grid', gap: 13 }}>
            {items.map((t, i) => (
              <Rise key={t} delay={16 + i * 7}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 99,
                      // 白地に載せる。surfaceCard 地だとコントラスト4.19でAAに届かない
                      background: '#ffffff',
                      border: `1px solid ${T.hairline}`,
                      color: T.primaryActive,
                      fontFamily: FONT_SANS,
                      fontSize: 14,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 5,
                      flex: 'none',
                    }}
                  >
                    {i + 1}
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 24,
                      color: T.ink,
                      lineHeight: 1.5,
                      fontWeight: 500,
                    }}
                  >
                    {t}
                  </div>
                </div>
              </Rise>
            ))}
          </div>
        </div>
        <Rise delay={8} distance={40}>
          <Shot src={A('03-result-card.png')} width={520} height={640} />
        </Rise>
      </div>
    </Stage>
  );
};

// 8: AI講評。判定はルール、講評はAI — その役割分担をはっきり見せる。
const S7B: React.FC = () => {
  const critique =
    '販売元は日本国外の事業者で、店舗名は日本語ですが、運営責任者名はローマ字表記です。出荷元はAmazonですが、販売元は別の事業者である点にご留意ください。記録メディアは、不具合が起きたときの影響が大きいカテゴリです。購入前に、返品条件とレビュー、販売元情報をもう一度ご確認ください。';
  const frame = useCurrentFrame();
  // 講評文をタイプライタで送り出し、「いま生成されている」感を出す
  const chars = Math.round(
    interpolate(frame, [40, 190], [0, critique.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  return (
    <Stage>
      <div style={{ display: 'grid', gap: 34, justifyItems: 'center', width: 1180 }}>
        <Rise>
          <div style={{ display: 'grid', gap: 10, justifyItems: 'center' }}>
            <Kicker>STEP 2 — AIが講評</Kicker>
            <div
              style={{
                fontFamily: FONT_SANS,
                fontSize: 40,
                fontWeight: 800,
                color: T.ink,
                letterSpacing: '-0.02em',
              }}
            >
              整理した結果を、AIが読み解く。
            </div>
          </div>
        </Rise>

        <Rise delay={16} distance={34}>
          <div
            style={{
              width: 1180,
              boxSizing: 'border-box',
              background: '#ffffff',
              border: `1px solid ${T.hairline}`,
              borderRadius: 18,
              padding: '32px 36px',
              boxShadow: '0 20px 48px rgba(20,20,19,0.10)',
              display: 'grid',
              gap: 18,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  // 19px bold = WCAGの「大きな文字」枠。17pxだと通常文字扱いでAA未達になる
                  fontSize: 19,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: T.onPrimary,
                  background: T.primary,
                  padding: '7px 15px',
                  borderRadius: 999,
                }}
              >
                AI講評
              </div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 18, color: T.muted }}>
                Claude Haiku 4.5
              </div>
            </div>
            <div
              style={{
                fontFamily: FONT_SANS,
                fontSize: 26,
                lineHeight: 1.85,
                color: T.body,
                minHeight: 200,
                wordBreak: 'keep-all',
              }}
            >
              {critique.slice(0, chars)}
              <span style={{ opacity: chars < critique.length ? 1 : 0 }}>▍</span>
            </div>
          </div>
        </Rise>

        <Rise delay={40}>
          <div
            style={{
              fontFamily: FONT_SANS,
              fontSize: 23,
              color: T.muted,
              textAlign: 'center',
            }}
          >
            確認レベルの判定はルールで決まります。AIは講評だけを書きます。
          </div>
        </Rise>
      </div>
    </Stage>
  );
};

// 8: 3段階の確認レベル
const S8: React.FC = () => {
  const levels = [
    { label: '要確認', note: '確認したい点が複数あります', c: T.levelHighFg, bg: T.levelHighBg, b: T.levelHighBorder },
    { label: '追加確認', note: 'もう一歩の確認を', c: '#6f540a', bg: '#faf3da', b: '#d4a017' },
    { label: '目立つ懸念なし', note: '懸念は見つかりません', c: '#285f36', bg: '#e7f3e9', b: '#5db872' },
  ];
  return (
    <Stage>
      <div style={{ display: 'grid', gap: 44, justifyItems: 'center' }}>
        <Rise>
          <Title size={52}>3段階の確認レベルで整理します。</Title>
        </Rise>
        <div style={{ display: 'flex', gap: 30 }}>
          {levels.map((l, i) => (
            <Rise key={l.label} delay={12 + i * 10} distance={34}>
              <div
                style={{
                  width: 400,
                  padding: '38px 34px',
                  borderRadius: 18,
                  background: l.bg,
                  border: `2px solid ${l.b}`,
                  display: 'grid',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 40,
                    fontWeight: 800,
                    color: l.c,
                  }}
                >
                  {l.label}
                </div>
                <div
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 22,
                    color: l.c,
                    lineHeight: 1.5,
                  }}
                >
                  {l.note}
                </div>
              </div>
            </Rise>
          ))}
        </div>
        <Rise delay={44}>
          <Sub>真贋を言い当てるのではなく、確認する材料を並べます。</Sub>
        </Rise>
      </div>
    </Stage>
  );
};

// 9: 3つの入口
const S9: React.FC = () => {
  const ways = [
    { n: '01', t: '貼り付ける', s: 'ブラウザで3秒' },
    { n: '02', t: 'ブックマークレット', s: '商品ページで1クリック' },
    { n: '03', t: 'iPhoneの共有シート', s: 'Safariから直接' },
  ];
  return (
    <Stage>
      <div style={{ display: 'grid', gap: 46, justifyItems: 'center' }}>
        <Rise>
          <Title size={52}>使い方は、3つ。</Title>
        </Rise>
        <div style={{ display: 'flex', gap: 28 }}>
          {ways.map((w, i) => (
            <Rise key={w.n} delay={10 + i * 12} distance={34}>
              <div
                style={{
                  width: 400,
                  padding: '40px 34px',
                  borderRadius: 18,
                  background: T.surfaceCard,
                  display: 'grid',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: '0.16em',
                    color: T.primaryActive,
                  }}
                >
                  {w.n}
                </div>
                <div
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 34,
                    fontWeight: 700,
                    color: T.ink,
                    lineHeight: 1.35,
                  }}
                >
                  {w.t}
                </div>
                <div
                  style={{ fontFamily: FONT_SANS, fontSize: 22, color: T.body }}
                >
                  {w.s}
                </div>
              </div>
            </Rise>
          ))}
        </div>
      </div>
    </Stage>
  );
};

// 10: 無料・プライバシー
const S10: React.FC = () => (
  <Stage dark>
    <div style={{ display: 'grid', gap: 34, justifyItems: 'center' }}>
      <Rise>
        <div
          style={{
            fontFamily: FONT_SANS,
            fontSize: 62,
            fontWeight: 800,
            color: T.onDark,
            letterSpacing: '-0.02em',
          }}
        >
          無料・登録不要。
        </div>
      </Rise>
      <Rise delay={14}>
        <div
          style={{
            fontFamily: FONT_SANS,
            fontSize: 30,
            color: T.onDarkSoft,
            lineHeight: 1.8,
            textAlign: 'center',
          }}
        >
          貼り付けた内容も、商品のURLも、
          <br />
          サーバーには残りません。
        </div>
      </Rise>
      <Rise delay={30}>
        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
          {[
            '電話番号は送信前にマスク',
            'URLはブラウザの外に出ない',
            'ソースコード公開',
          ].map((t) => (
            <div
              key={t}
              style={{
                fontFamily: FONT_SANS,
                fontSize: 21,
                color: T.onDarkSoft,
                border: `1px solid ${T.onDarkSoft}55`,
                borderRadius: 10,
                padding: '12px 22px',
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </Rise>
    </div>
    <Caption onDark>無料・登録不要／サーバーに残りません</Caption>
  </Stage>
);

// 11: 締め
const S11: React.FC = () => (
  <Stage>
    <div style={{ display: 'grid', gap: 28, justifyItems: 'center' }}>
      <Rise>
        <Wordmark size={104} />
      </Rise>
      <Rise delay={10}>
        <Title size={44}>ポチる前に、販売元を3秒チェック。</Title>
      </Rise>
      <Rise delay={22}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 34, marginTop: 14 }}>
          <div
            style={{
              padding: 12,
              background: '#ffffff',
              border: `1px solid ${T.hairline}`,
              borderRadius: 14,
              display: 'flex',
            }}
          >
            {/* 296px = QR素材の実寸。縮小するとモジュールが潰れて読み取れなくなる。
                素材側に4モジュール分のクワイエットゾーンを焼き込んである */}
            <img
              src={A('qr-pochimae.png')}
              width={296}
              height={296}
              style={{ display: 'block', imageRendering: 'pixelated' }}
              alt=""
            />
          </div>
          <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
            <div
              style={{
                fontFamily: FONT_SANS,
                fontSize: 32,
                fontWeight: 700,
                color: T.onPrimary,
                background: T.primary,
                padding: '18px 40px',
                borderRadius: 14,
              }}
            >
              pochimae.vercel.app
            </div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 21, color: T.muted }}>
              無料・登録不要。QRからすぐ開けます。
            </div>
          </div>
        </div>
      </Rise>
      <Rise delay={34}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 20, color: T.muted, marginTop: 12 }}>
          ステップアウトマーケティング合同会社
        </div>
      </Rise>
    </div>
  </Stage>
);

// 並び順が音声 scene-NN.wav と theme.ts の SCENES に対応する。増減時は3つとも直すこと。
const SCENE_COMPONENTS = [S1, S2, S3, S4, S5, S6, S7, S7B, S8, S9, S10, S11];

export const PochimaeHowTo: React.FC = () => (
  <AbsoluteFill style={{ background: T.canvas }}>
    {SCENE_COMPONENTS.map((C, i) => {
      const id = i + 1;
      const { from, durationInFrames } = sceneFrames(id);
      return (
        <Sequence key={id} from={from} durationInFrames={durationInFrames}>
          <SceneFade
            durationInFrames={durationInFrames}
            last={id === SCENE_COMPONENTS.length}
          >
            <C />
          </SceneFade>
          <Audio src={V(id)} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);

export { FPS, SCENES };
