from google.cloud import texttospeech
from pathlib import Path
import subprocess, json

# 長尺版と同じ声・同じ設定。スクリプト位置からの相対パス。
ROOT = Path(__file__).resolve().parent.parent
NARR = ROOT / 'narration-short'
AUD  = ROOT / 'audio-short'
AUD.mkdir(exist_ok=True)

client = texttospeech.TextToSpeechClient()
voice = texttospeech.VoiceSelectionParams(language_code="ja-JP", name="ja-JP-Chirp3-HD-Charon")
cfg = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.LINEAR16,
                               sample_rate_hertz=48000)

timings = []
for txt in sorted(NARR.glob('short-*.txt')):
    text = txt.read_text(encoding='utf-8').strip()
    resp = client.synthesize_speech(input=texttospeech.SynthesisInput(text=text), voice=voice, audio_config=cfg)
    wav = AUD / (txt.stem + '.wav')
    wav.write_bytes(resp.audio_content)
    dur = float(subprocess.run(
        ['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(wav)],
        capture_output=True, text=True).stdout.strip())
    timings.append({'scene': txt.stem, 'sec': round(dur,2), 'text': text})
    print(f"{txt.stem}: {dur:.2f}s  {text[:26]}...")

(AUD / 'timings.json').write_text(json.dumps(timings, ensure_ascii=False, indent=2), encoding='utf-8')
print(f"\n合計ナレーション: {sum(t['sec'] for t in timings):.2f}秒")
