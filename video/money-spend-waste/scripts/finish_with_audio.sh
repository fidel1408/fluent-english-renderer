#!/usr/bin/env bash
# One command once the 7 clips exist in audio/ (recorded, or made with scripts/generate_voiceover.mjs):
#   bash scripts/finish_with_audio.sh
# measures real durations -> re-times captions -> mixes the voice track -> renders the 3 MP4 variants WITH sound.
set -euo pipefail
cd "$(dirname "$0")/.."
node scripts/measure_audio.mjs --write
node scripts/mix_audio.mjs
for m in 2 1 0; do node scripts/render.mjs --mode "$m" --audio audio/voiceover_mix.wav --out "output/spend-or-waste_mode${m}_with-audio.mp4"; done
echo "Done. Listen to output/*_with-audio.mp4 before approving."
