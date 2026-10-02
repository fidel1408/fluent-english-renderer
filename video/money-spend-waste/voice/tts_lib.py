"""Local neural TTS wrappers (sherpa-onnx). Models live in $TTS_DIR (default /opt/tts); see setup_voices.sh."""
import os, numpy as np, sherpa_onnx
TTS = os.environ.get('TTS_DIR', '/opt/tts')
_cache = {}

def piper(name):
    if name not in _cache:
        d = f'{TTS}/{name}'
        onnx = [f for f in os.listdir(d) if f.endswith('.onnx')][0]
        cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(vits=sherpa_onnx.OfflineTtsVitsModelConfig(
            model=f'{d}/{onnx}', tokens=f'{d}/tokens.txt', data_dir=f'{d}/espeak-ng-data', noise_scale=float(os.environ.get('NS','0.667')), noise_scale_w=float(os.environ.get('NSW','0.8'))), num_threads=4, provider='cpu'))
        _cache[name] = sherpa_onnx.OfflineTts(cfg)
    return _cache[name]

def kokoro():
    if 'kokoro' not in _cache:
        d = f'{TTS}/kokoro-multi-lang-v1_0'
        k = sherpa_onnx.OfflineTtsKokoroModelConfig(model=f'{d}/model.onnx', voices=f'{d}/voices.bin', tokens=f'{d}/tokens.txt',
            data_dir=f'{d}/espeak-ng-data', dict_dir=f'{d}/dict', lexicon=f'{d}/lexicon-us-en.txt,{d}/lexicon-gb-en.txt', lang='')
        cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(kokoro=k, num_threads=4, provider='cpu'))
        _cache['kokoro'] = sherpa_onnx.OfflineTts(cfg)
    return _cache['kokoro']

def synth(engine, text, sid=0, speed=1.0, lang=None):
    """engine: 'piper:<model dir>' or 'kokoro'. returns (float32 mono samples, sample_rate)"""
    if engine == 'kokoro':
        t = kokoro()
    else:
        t = piper(engine.split(':', 1)[1])
    g = t.generate(text, sid=sid, speed=speed)
    return np.array(g.samples, dtype=np.float32), g.sample_rate

_asr = {}
def asr(lang, size='small'):
    size = os.environ.get('ASR_SIZE', size)
    if (lang, size) not in _asr:
        d = f'{TTS}/sherpa-onnx-whisper-{size}'
        _asr[(lang, size)] = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f'{d}/{size}-encoder.int8.onnx', decoder=f'{d}/{size}-decoder.int8.onnx',
            tokens=f'{d}/{size}-tokens.txt', language=lang, task='transcribe', num_threads=4)
    return _asr[(lang, size)]

def transcribe(samples, sr, lang, size='small'):
    r = asr(lang, size); s = r.create_stream(); s.accept_waveform(sr, samples); r.decode_stream(s); return s.result.text.strip()
