import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { FONT_DISPLAY, FONT_SANS, T } from './theme';

// 共通: 下から浮き上がってフェードイン
export const Rise: React.FC<{
  children: React.ReactNode;
  delay?: number;
  distance?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, distance = 28, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  const opacity = interpolate(frame - delay, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        opacity,
        transform: `translateY(${interpolate(s, [0, 1], [distance, 0])}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// シーン全体の出入り。
// last=true（最終シーン）ではフェードアウトしない — 動画の最後のフレームが
// CTAの消えた空白になり、ループ再生やサムネイルで損をするため。
export const SceneFade: React.FC<{
  children: React.ReactNode;
  durationInFrames: number;
  last?: boolean;
}> = ({ children, durationInFrames, last }) => {
  const frame = useCurrentFrame();
  const opacity = last
    ? interpolate(frame, [0, 8], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : interpolate(
        frame,
        [0, 8, durationInFrames - 8, durationInFrames],
        [0, 1, 1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
      );
  return <div style={{ opacity, width: '100%', height: '100%' }}>{children}</div>;
};

export const Kicker: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontFamily: FONT_SANS,
      fontSize: 22,
      fontWeight: 700,
      letterSpacing: '0.2em',
      color: T.primaryActive,
    }}
  >
    {children}
  </div>
);

export const Title: React.FC<{
  children: React.ReactNode;
  size?: number;
  align?: 'left' | 'center';
}> = ({ children, size = 64, align = 'center' }) => (
  <h1
    style={{
      fontFamily: FONT_SANS,
      fontSize: size,
      fontWeight: 800,
      color: T.ink,
      lineHeight: 1.3,
      letterSpacing: '-0.02em',
      textAlign: align,
      margin: 0,
      wordBreak: 'keep-all',
    }}
  >
    {children}
  </h1>
);

export const Sub: React.FC<{
  children: React.ReactNode;
  align?: 'left' | 'center';
}> = ({ children, align = 'center' }) => (
  <p
    style={{
      fontFamily: FONT_SANS,
      fontSize: 27,
      color: T.body,
      lineHeight: 1.75,
      textAlign: align,
      margin: 0,
    }}
  >
    {children}
  </p>
);

// ロゴだけ明朝（サイト本体と同じ扱い）
export const Wordmark: React.FC<{ size?: number; color?: string }> = ({
  size = 92,
  color = T.ink,
}) => (
  <div
    style={{
      fontFamily: FONT_DISPLAY,
      fontWeight: 700,
      fontSize: size,
      color,
      letterSpacing: '0.04em',
    }}
  >
    ダレウリ
  </div>
);

// スクリーンショットの額装
export const Shot: React.FC<{
  src: string;
  width: number;
  height?: number;
  fade?: boolean;
}> = ({ src, width, height, fade = true }) => (
  <div
    style={{
      width,
      height,
      overflow: 'hidden',
      position: 'relative',
      borderRadius: 18,
      border: `1px solid ${T.hairline}`,
      boxShadow: '0 24px 60px rgba(20,20,19,0.16)',
      background: '#fff',
    }}
  >
    <img src={src} style={{ width: '100%', display: 'block' }} alt="" />
    {fade && height ? (
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 110,
          background:
            'linear-gradient(to bottom, rgba(255,255,255,0), #ffffff)',
        }}
      />
    ) : null}
  </div>
);

// 画面下の常設テロップ（無音再生でも意味が通るように）
// dark=true のシーンでは、背景に埋もれないよう白箱に反転する
export const Caption: React.FC<{
  children: React.ReactNode;
  onDark?: boolean;
}> = ({ children, onDark }) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 56,
      display: 'flex',
      justifyContent: 'center',
    }}
  >
    <div
      style={{
        fontFamily: FONT_SANS,
        fontSize: 26,
        fontWeight: 500,
        color: onDark ? T.ink : T.onDark,
        background: onDark ? 'rgba(250,249,245,0.94)' : 'rgba(24,23,21,0.88)',
        padding: '14px 30px',
        borderRadius: 12,
        maxWidth: 1500,
        textAlign: 'center',
        lineHeight: 1.5,
      }}
    >
      {children}
    </div>
  </div>
);
