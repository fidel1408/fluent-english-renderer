#!/usr/bin/env bash
# MS-01 motion test: 96 frames @24fps, 640x360, 24 spp. Resumable (skips existing frames). Usage: tools/render_motion_test.sh <python-with-bpy>
cd "$(dirname "$0")/.."; PY=${1:-python3}
$PY blender/maya_shot.py anim 1 96 renders_tmp/motion640 640 24
