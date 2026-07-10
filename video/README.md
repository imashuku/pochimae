# ダレウリ 使い方動画

Remotion + Google Cloud TTS で作る60秒の紹介動画。

- 映像: `src/Dareuri.tsx`（1920×1080 / 30fps / 80.7秒・11シーン）
- ナレーション台本: `narration/scene-NN.txt`
- 音声生成: Google Cloud TTS（`ja-JP-Chirp3-HD-Charon`、ADC認証）
- 素材: `assets/`（本番サイトの実画面をPlaywrightで撮影）

デザインはダレウリ本体と同じClaude Designトークン（`src/theme.ts`）。
ロゴのみ明朝、UI見出しは太ゴシック、という本体のルールを踏襲。

## 作り直す

```bash
# 1. 素材（本番サイトの実画面）を撮り直す場合
node ../../..//scratchpad/vid_assets.mjs   # ※scratchpadのスクリプト

# 2. ナレーションを変えたら音声を再生成
/tmp/gtts-venv/bin/python scripts/tts.py   # 実尺が timings.json に出る
# → src/theme.ts の SCENES を実尺+0.35秒で更新

# 3. レンダリング
npm run render     # out/dareuri-howto.mp4
```

## 注意

- シーンの尺は**TTSの実測尺**に合わせている。台本を変えたら必ず音声を再生成し、`SCENES` を更新すること
- 無音再生（Xのタイムライン等）でも意味が通るよう、実画面のシーンには常設テロップを入れている
