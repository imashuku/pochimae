// Claude Design tokens（~/.claude/design/claude/DESIGN.md）に準拠。
// ダレウリ本体と同じ色で、ブランドの一貫性を保つ。
export const T = {
  canvas: '#faf9f5',
  surfaceSoft: '#f5f0e8',
  surfaceCard: '#efe9de',
  surfaceDark: '#181715',
  ink: '#141413',
  body: '#3d3d3a',
  muted: '#6c6a64',
  hairline: '#e6dfd8',
  primary: '#cc785c',
  primaryActive: '#a9583e',
  onPrimary: '#ffffff',
  onDark: '#faf9f5',
  onDarkSoft: '#a09d96',
  levelHighBg: '#fbe9e7',
  levelHighFg: '#8f2b22',
  levelHighBorder: '#c64545',
} as const;

export const FONT_SANS =
  '"Noto Sans JP","Hiragino Kaku Gothic ProN","Hiragino Sans",sans-serif';
export const FONT_DISPLAY =
  '"Shippori Mincho","Hiragino Mincho ProN",serif';

export const FPS = 30;

// TTSの実測尺（audio/timings.json）＋シーン間の余白0.35秒
export const SCENES = [
  { id: 1, sec: 5.67 },
  { id: 2, sec: 10.55 },
  { id: 3, sec: 5.99 },
  { id: 4, sec: 12.79 },
  { id: 5, sec: 4.75 },
  { id: 6, sec: 6.87 },
  { id: 7, sec: 10.63 },
  { id: 8, sec: 9.39 },
  { id: 9, sec: 5.63 },
  { id: 10, sec: 6.83 },
  { id: 11, sec: 8.51 },
  { id: 12, sec: 4.79 },
] as const;

export const TOTAL_FRAMES = Math.round(
  SCENES.reduce((a, s) => a + s.sec, 0) * FPS,
);

export function sceneFrames(id: number) {
  const from = SCENES.slice(0, id - 1).reduce((a, s) => a + s.sec, 0);
  const dur = SCENES[id - 1].sec;
  return { from: Math.round(from * FPS), durationInFrames: Math.round(dur * FPS) };
}
