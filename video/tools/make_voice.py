"""Generate narration + English teaching voice with Kokoro (Apache-2.0, offline ONNX).
Spanish: lang es-419 (Latin-American phonemes, seseo). English: en-us.
Writes audio/voice/*.wav (48 kHz mono) and audio/voice/voice_manifest.json"""
import json, os, sys, numpy as np, soundfile as sf
from scipy.signal import resample_poly
from kokoro_onnx import Kokoro
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
k = Kokoro("models/kokoro-v1.0.onnx", "models/voices-v1.0.bin")
ES_VOICE = os.environ.get("ES_VOICE", "em_alex"); EN_VOICE = os.environ.get("EN_VOICE", "af_heart")
LINES = {
 "n1_hook":  ("es-419", ES_VOICE, 0.93, "¿Entiendes inglés, pero te bloqueas al hablar?"),
 "n2_first": ("es-419", ES_VOICE, 0.93, "Empieza con una frase que puedas hacer tuya."),
 "n4_you":   ("es-419", ES_VOICE, 0.93, "Ahora tú: ¿qué te gustaría hacer?"),
 "n5_school":("es-419", ES_VOICE, 0.93, "Practica inglés con Fluent English, en clases en línea."),
 "n6_cta":   ("es-419", ES_VOICE, 0.93, "Escríbenos “INGLÉS” y conoce las opciones."),
 "e1_normal":("en-us", EN_VOICE, 0.92, "I'd like to learn English."),
 "e2_slow":  ("en-us", EN_VOICE, 0.72, "I'd like to learn English."),
 "e3_blank": ("en-us", EN_VOICE, 0.80, "I'd like to..."),
}
os.makedirs("audio/voice", exist_ok=True); man = {}
def trim(x, sr, thr=0.01, pad=0.04):
    idx = np.where(np.abs(x) > thr*np.max(np.abs(x)))[0]
    a, b = max(0, idx[0]-int(pad*sr)), min(len(x), idx[-1]+int(pad*sr)); return x[a:b]
for name,(lang,voice,speed,text) in LINES.items():
    # Fluent English is a brand name: give the Spanish voice an English-ish phoneme hint via text as-is
    s, sr = k.create(text, voice=voice, speed=speed, lang=lang)
    s = trim(np.asarray(s, dtype=np.float64), sr)
    s = resample_poly(s, 48000, sr) if sr != 48000 else s
    s = s / np.max(np.abs(s)) * 0.8
    fade = int(0.012*48000); s[:fade] *= np.linspace(0,1,fade); s[-fade:] *= np.linspace(1,0,fade)
    sf.write(f"audio/voice/{name}.wav", s, 48000, subtype="PCM_24")
    man[name] = dict(voice=voice, lang=lang, speed=speed, text=text, duration=round(len(s)/48000,3))
    print(name, voice, man[name]["duration"])
json.dump(man, open("audio/voice/voice_manifest.json","w"), ensure_ascii=False, indent=1)
