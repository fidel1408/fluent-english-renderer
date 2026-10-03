#!/usr/bin/env bash
# Key-frame stills for shot MS-01 (1280x720, 64 spp). Usage: tools/render_keyframes.sh <python-with-bpy>
cd "$(dirname "$0")/.."; PY=${1:-python3}; mkdir -p renders/keyframes
for f in 1 40 80; do $PY blender/maya_shot.py still $f renders/keyframes/MS01_f$(printf %03d $f).png 1280 64; done
