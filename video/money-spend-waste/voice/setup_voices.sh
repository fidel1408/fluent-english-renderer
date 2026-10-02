#!/usr/bin/env bash
# Downloads the open-source speech models used for the narration (no account, API key or payment needed) into $TTS_DIR (default /opt/tts).
#   Piper es_MX "claude" (high)  — Mexican Spanish narrator            licence: Apache-2.0
#   Kokoro multi-lang v1.0       — US English example voice (am_michael) and in-Spanish English words (af_sarah)   licence: Apache-2.0
#   Whisper small + medium       — speech-to-text, used ONLY to check the generated audio (MIT)
# Python deps: pip install numpy soundfile sherpa-onnx
set -euo pipefail
TTS_DIR="${TTS_DIR:-/opt/tts}"; mkdir -p "$TTS_DIR"; cd "$TTS_DIR"
B=https://github.com/k2-fsa/sherpa-onnx/releases/download
get() { [ -d "${1%%.*}" ] || { curl -fsSL -o "$1" "$2/$1" && tar xjf "$1" && rm "$1"; }; }
get vits-piper-es_MX-claude-high.tar.bz2 $B/tts-models
get kokoro-multi-lang-v1_0.tar.bz2 $B/tts-models
get sherpa-onnx-whisper-small.tar.bz2 $B/asr-models
get sherpa-onnx-whisper-medium.tar.bz2 $B/asr-models
echo "models ready in $TTS_DIR"
