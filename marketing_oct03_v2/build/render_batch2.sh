#!/bin/sh
# renders the three October batch-2 videos one after another
cd "$(dirname "$0")/.." || exit 1
node build/render.js clarify_deadline --out out/FE261019-CLARIFY_batch2_single-host_narrated_QA-pending.mp4 --tag "batch2 take1 provisional" &&
node build/render.js tell_me_more --out out/FE261021-MORE_batch2_single-host_narrated_QA-pending.mp4 --tag "batch2 take1 provisional" &&
node build/render.js private_company --out out/FE261023-PRIVATE_batch2_single-host_narrated_QA-pending.mp4 --tag "batch2 take1 provisional TikTok-only"
