#!/bin/sh
# renders the three October batch-3 videos one after another
cd "$(dirname "$0")/.." || exit 1
node build/render.js since_for --out out/FE261026-SINCEFOR_batch3_single-host_narrated_QA-pending.mp4 --tag "batch3 take1 provisional" &&
node build/render.js used_to --out out/FE261028-USED_batch3_single-host_narrated_QA-pending.mp4 --tag "batch3 take2 provisional" &&
node build/render.js trial_faq --out out/FE261030-TRIALFAQ_batch3_single-host_narrated_QA-pending.mp4 --tag "batch3 take2 provisional TikTok-only"
