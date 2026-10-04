#!/bin/bash
# Runs every QA check and writes outputs to ../qa/after (new build) and ../qa/before (unchanged v4 baseline, new suites only).
cd "$(dirname "$0")/.." || exit 1
A=../qa/after; B=../qa/before; mkdir -p $A $B
node build/build.js > $A/build.txt 2>&1
node build/probe.js > $A/probe-all-steps.txt 2>&1
node build/corpus-run.js $A/ipa-corpus.json > $A/ipa-corpus-summary.txt 2>&1
node build/audit-ipa.js "$PWD/fluent-english-be-lesson.html" $A/ipa-audit-desktop.json > $A/ipa-audit-desktop.txt 2>&1
W=390 H=844 node build/audit-ipa.js "$PWD/fluent-english-be-lesson.html" $A/ipa-audit-phone.json > $A/ipa-audit-phone.txt 2>&1
node build/inventory.js $A/inventory.json > $A/inventory-summary.txt 2>&1
QA_OUT=$A/regression-summary.json node build/test-regression.js > $A/test-regression.txt 2>&1
QA_OUT=$A/viewports-summary.json node build/test-viewports.js > $A/test-viewports.txt 2>&1
node build/test.js > $A/test-main.txt 2>&1
node build/test-speech.js > $A/test-speech.txt 2>&1
node build/test-video.js > $A/test-video.txt 2>&1
node build/test-audio.js > $A/test-audio.txt 2>&1
# same new suites against the unchanged baseline (expected to FAIL where the defects exist)
QA_OUT=$B/regression-summary.json timeout 600 node build/test-regression.js "$PWD/versions/lesson-v4-baseline.html" > $B/test-regression.txt 2>&1
QA_OUT=$B/viewports-summary.json timeout 400 node build/test-viewports.js "$PWD/versions/lesson-v4-baseline.html" > $B/test-viewports.txt 2>&1
echo finished > $A/_qa_done
