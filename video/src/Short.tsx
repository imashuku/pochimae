import React from 'react';
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import { FONT_SANS, FPS, T } from './theme';
import { Caption, Rise, SceneFade, Title, Wordmark } from './parts';
import { OpeningQuestion } from './Dareuri';

// SNS用の30秒版。長尺版とは別構成 —「3秒で終わる」と言うなら、
// その3秒を実際に見せる。デモは本番サイトのPlaywright実録画。
const A = (n: string) => staticFile(`assets/${n}`);
const V = (n: number) => staticFile(`audio-short/short-0${n}.wav`);

// TTSの実測尺 ＋ 余白0.3秒
export const SHORT_SCENES = [
  { id: 1, sec: 5.98 },
  { id: 2, sec: 15.95 },
  { id: 3, sec: 7.26 },
] as const;

export const SHORT_TOTAL_FRAMES = Math.round(
  SHORT_SCENES.reduce((a, s) => a + s.sec, 0) * FPS,
);

function shortFrames(id: number) {
  const from = SHORT_SCENES.slice(0, id - 1).reduce((a, s) => a + s.sec, 0);
  const dur = SHORT_SCENES[id - 1].sec;
  return { from: Math.round(from * FPS), durationInFrames: Math.round(dur * FPS) };
}

const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      background: T.canvas,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {children}
  </AbsoluteFill>
);

// 2: 実演。本番サイトを操作した実録画をそのまま流す。
// 録画は12.84秒。シーン尺15.95秒に合わせて 0.805倍速で引き伸ばす。
// 貼り付けは一瞬（打鍵ではない）。判定結果は録画の8.6秒地点 = シーン内10.7秒 = フレーム320。
// キャプションはその手前で消す。いちばん見せたい画に字幕を被せない。
const RESULT_FRAME = 320;

const S2: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const captionOpacity = interpolate(
    frame,
    [0, 10, RESULT_FRAME - 40, RESULT_FRAME - 10],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  return (
    <Stage>
      <div
        style={{
          opacity,
          width: 1520,
          borderRadius: 20,
          overflow: 'hidden',
          border: `1px solid ${T.hairline}`,
          boxShadow: '0 30px 70px rgba(20,20,19,0.18)',
          background: '#fff',
        }}
      >
        <OffthreadVideo
          src={A('demo-check.mp4')}
          playbackRate={0.805}
          muted
          style={{ width: '100%', display: 'block' }}
        />
      </div>
      <div style={{ opacity: captionOpacity }}>
        <Caption>貼り付けるだけ。9つの観点で整理し、3段階の確認レベルで示します</Caption>
      </div>
    </Stage>
  );
};

// 3: 締め。QRは実寸のまま（縮小するとモジュールが潰れて読めない）
const S3: React.FC = () => (
  <Stage>
    <div style={{ display: 'grid', gap: 26, justifyItems: 'center' }}>
      <Rise>
        <Wordmark size={100} />
      </Rise>
      <Rise delay={10}>
        <Title size={42}>ポチる前に、販売元を3秒チェック。</Title>
      </Rise>
      <Rise delay={20}>
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
            <img
              src={A('qr-dareuri.png')}
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
              dareuri.app
            </div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 21, color: T.muted }}>
              無料・登録不要。QRからすぐ開けます。
            </div>
          </div>
        </div>
      </Rise>
    </div>
  </Stage>
);

// 冒頭は長尺版と同じカット（Dareuri.tsx から共有）
const SCENE_COMPONENTS = [OpeningQuestion, S2, S3];

export const DareuriShort: React.FC = () => (
  <AbsoluteFill style={{ background: T.canvas }}>
    {SCENE_COMPONENTS.map((C, i) => {
      const id = i + 1;
      const { from, durationInFrames } = shortFrames(id);
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
