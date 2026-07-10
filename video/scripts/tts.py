from google.cloud import texttospeech
from pathlib import Path
import subprocess, json

# スクリプト位置からの相対。絶対パスを書くとリポジトリ名を変えたとき壊れる
ROOT = Path(__file__).resolve().parent.parent
NARR = ROOT / 'narration'
AUD  = ROOT / 'audio'
AUD.mkdir(exist_ok=True)

client = texttospeech.TextToSpeechClient()
voice = texttospeech.VoiceSelectionParams(language_code="ja-JP", name="ja-JP-Chirp3-HD-Charon")
cfg = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.LINEAR16,
                               sample_rate_hertz=48000, speaking_rate=1.0)

timings = []
for f in sorted(NARR.glob('scene-*.txt')):
    text = f.read_text(encoding='utf-8').strip()
    resp = client.synthesize_speech(input=texttospeech.SynthesisInput(text=text), voice=voice, audio_config=cfg)
    wav = AUD / f'{f.stem}.wav'
    wav.write_bytes(resp.audio_content)
    dur = float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(wav)]).strip())
    timings.append({'scene': f.stem, 'sec': round(dur,2), 'text': text})
    print(f'{f.stem}: {dur:.2f}s  {text[:28]}...')

total = sum(t['sec'] for t in timings)
print(f'\n合計ナレーション: {total:.2f}秒')
(AUD / 'timings.json').write_text(json.dumps(timings, ensure_ascii=False, indent=2), encoding='utf-8')
