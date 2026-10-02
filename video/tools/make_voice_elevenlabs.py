"""ElevenLabs voice generation (drop-in replacement for tools/make_voice.py). NOT YET RUN in this session:
the session proxy attached the ElevenLabs credential to the host 'apilelevenlabs.io' (typo) instead of api.elevenlabs.io,
so every call returned 401. Run it once the connector is fixed, or with your own key:  ELEVENLABS_API_KEY=... python tools/make_voice_elevenlabs.py --audition
Usage:
  python tools/make_voice_elevenlabs.py --audition            # writes 3 short samples per candidate voice to audio/audition_el/ (uses ~1.5k characters of credits)
  ES_VOICE_ID=<id> EN_VOICE_ID=<id> python tools/make_voice_elevenlabs.py   # generates the final clips (~400 characters)
Then:  python tools/make_timeline.py && python tools/make_audio.py && python tools/render.py"""
import os, sys, json, io, requests, numpy as np, soundfile as sf
from scipy.signal import resample_poly
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
API = "https://api.elevenlabs.io/v1"; KEY = os.environ.get("ELEVENLABS_API_KEY"); H = {"xi-api-key": KEY} if KEY else {}
MODEL = os.environ.get("EL_MODEL", "eleven_multilingual_v2")
LINES = json.load(open("audio/voice/voice_manifest.json")) if os.path.exists("audio/voice/voice_manifest.json") else None
TEXT = {"n1_hook": "¿Entiendes inglés, pero te bloqueas al hablar?", "n2_first": "Empieza con una frase que puedas hacer tuya.", "n4_you": "Ahora tú: ¿qué te gustaría hacer?",
        "n5_school": "Practica inglés con Fluent English, en clases en línea.", "n6_cta": "Escríbenos “INGLÉS” y conoce las opciones.",
        "e1_normal": "I'd like to learn English.", "e2_slow": "I'd like to ... learn ... English."}
def tts(voice_id, text, lang, stability=0.45, style=0.25, speed=1.0):
    r = requests.post(f"{API}/text-to-speech/{voice_id}?output_format=pcm_24000", headers={**H, "Content-Type": "application/json"},
        json={"text": text, "model_id": MODEL, "language_code": lang, "voice_settings": {"stability": stability, "similarity_boost": 0.8, "style": style, "use_speaker_boost": True, "speed": speed}}, timeout=120)
    r.raise_for_status(); return np.frombuffer(r.content, dtype="<i2").astype(np.float64) / 32768
def finish(x):
    idx = np.where(np.abs(x) > 0.01 * np.max(np.abs(x)))[0]; x = x[max(0, idx[0] - 960):idx[-1] + 960]
    x = resample_poly(x, 2, 1); x = x / np.max(np.abs(x)) * 0.8; f = 576; x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f); return x
if "--audition" in sys.argv:
    os.makedirs("audio/audition_el", exist_ok=True)
    # Mexican-Spanish and American-English candidates from the shared voice library (filters per ElevenLabs API docs)
    for name, params, text, lang in [("es", {"language": "es", "accent": "mexican", "page_size": 8, "category": "professional"}, TEXT["n2_first"], "es"),
                                      ("en", {"language": "en", "accent": "american", "page_size": 8, "category": "professional"}, TEXT["e1_normal"], "en")]:
        j = requests.get(f"{API}/shared-voices", headers=H, params=params, timeout=60).json()
        for v in j.get("voices", [])[:6]:
            try: sf.write(f"audio/audition_el/{name}_{v['name'].split()[0]}_{v['voice_id']}.wav", finish(tts(v["voice_id"], text, lang)), 48000)
            except Exception as e: print("skip", v["name"], e)
    print("Listen to audio/audition_el/*.wav, then re-run with ES_VOICE_ID / EN_VOICE_ID set."); sys.exit()
ES, EN = os.environ["ES_VOICE_ID"], os.environ["EN_VOICE_ID"]; os.makedirs("audio/voice", exist_ok=True); man = {}
for k, text in TEXT.items():
    es = k.startswith("n"); x = finish(tts(ES if es else EN, text, "es" if es else "en", stability=0.5 if es else 0.6, speed=1.0 if k != "e2_slow" else 0.8))
    sf.write(f"audio/voice/{k}.wav", x, 48000, subtype="PCM_24"); man[k] = dict(voice=ES if es else EN, lang="es-MX" if es else "en-US", speed=1.0, text=text, duration=round(len(x) / 48000, 3)); print(k, man[k]["duration"])
json.dump(man, open("audio/voice/voice_manifest.json", "w"), ensure_ascii=False, indent=1)
