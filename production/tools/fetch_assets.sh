#!/usr/bin/env bash
# Re-creates production/assets/makehuman from public registries (npm + PyPI). Assets are NOT committed (licences not cleared for redistribution).
set -euo pipefail
cd "$(dirname "$0")/.."; mkdir -p assets/_dl assets/makehuman; cd assets/_dl
npm pack makehuman-data@0.0.2 >/dev/null
python3 -m pip download makehuman==1.3.2 --no-deps -d . >/dev/null
tar xzf makehuman-data-0.0.2.tgz -C ../makehuman --strip-components=1 package/public package/src package/readme.md
unzip -q -o makehuman-1.3.2-py3-none-any.whl 'makehuman/data/targets.npz' 'makehuman/licenses/*' -d ../makehuman_wheel
cp ../makehuman_wheel/makehuman/data/targets.npz ../makehuman/targets.npz
echo "assets ready: $(du -sh ../makehuman | cut -f1)"
