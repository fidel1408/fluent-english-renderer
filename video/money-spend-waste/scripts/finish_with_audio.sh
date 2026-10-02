#!/usr/bin/env bash
# Full soundtrack build + final videos, no external services:
#   (optional) python3 voice/build_narration.py     # re-synthesise narration with local neural voices (see voice/README.md)
#   node scripts/render_audio.mjs                   # music + ambience + effects (Web Audio) + narration -> audio/export/soundtrack.wav
#   node scripts/render.mjs --audio ...             # muxes it into the three MP4 variants
set -euo pipefail
cd "$(dirname "$0")/.."
node scripts/render_audio.mjs "$@"
python3 scripts/analyze_audio.py
for m in 2 1 0; do node scripts/render.mjs --mode "$m" --audio audio/export/soundtrack.wav --out "output/spend-or-waste_mode${m}.mp4"; done
python3 scripts/verify_video_audio.py output/spend-or-waste_mode2.mp4
