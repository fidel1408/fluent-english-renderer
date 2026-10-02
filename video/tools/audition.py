import sys, soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro("models/kokoro-v1.0.onnx", "models/voices-v1.0.bin")
print(sorted(k.get_voices()))
es = "¿Entiendes inglés, pero te bloqueas al hablar? Empieza con una frase que puedas hacer tuya."
en = "I'd like to learn English."
import os
os.makedirs("audio/audition", exist_ok=True)
for v in ["ef_dora","em_alex","em_santa"]:
    s,sr = k.create(es, voice=v, speed=0.95, lang="es"); sf.write(f"audio/audition/es_{v}.wav", s, sr); print(v, len(s)/sr)
for v in ["af_heart","af_bella","af_nicole","af_sarah","am_adam","am_michael","am_fenix","bf_emma"]:
    s,sr = k.create(en, voice=v, speed=0.9, lang="en-us"); sf.write(f"audio/audition/en_{v}.wav", s, sr); print(v, len(s)/sr)
