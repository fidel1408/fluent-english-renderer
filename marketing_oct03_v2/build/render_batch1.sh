#!/bin/sh
# renders the three October batch-1 videos one after another (deterministic frames -> H.264/AAC)
cd "$(dirname "$0")/.." || exit 1
node build/render.js can_have --out out/FE261012-CANHAVE_batch1_single-host_narrated_QA-pending.mp4 --tag "batch1 take2" &&
node build/render.js borrow_lend --out out/FE261014-BORROW_batch1_single-host_narrated_QA-pending.mp4 --tag "batch1 take2" &&
node build/render.js schedule_options --out out/FE261016-SCHEDULE_batch1_single-host_narrated_QA-pending.mp4 --tag "batch1 take2 TikTok-only"
