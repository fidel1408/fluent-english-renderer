#!/bin/bash
# Final sequential run on the final build: before-evidence, screenshots (expanded + TRUE viewports), contact sheets, then all QA suites + report.
cd "$(dirname "$0")/.." || exit 1
Q=../qa; node build/build.js > /dev/null 2>&1
node build/before-evidence.js 2>&1 | grep -v proxy > $Q/before/before-evidence.txt
node build/contact.js desktop $Q/after/shots/desktop > /tmp/f1.txt 2>&1
node build/contact.js phone $Q/after/shots/phone > /tmp/f2.txt 2>&1
REAL=1 VW=390 VH=844 node build/contact.js phone $Q/after/shots/phone-real > /tmp/f3.txt 2>&1
REAL=1 VW=844 VH=390 node build/contact.js phone $Q/after/shots/phone-landscape > /tmp/f4.txt 2>&1
REAL=1 VW=1280 VH=720 node build/contact.js desktop $Q/after/shots/desktop-real > /tmp/f5.txt 2>&1
for d in desktop phone phone-real phone-landscape desktop-real; do node build/montage.js $Q/after/shots/$d $Q/after/contact-sheets > /tmp/fm_$d.txt 2>&1; done
echo shots_done > /tmp/final_shots_done
./build/run-qa.sh > /tmp/runqa2.log 2>&1
node build/make-report.js > /tmp/report.txt 2>&1
echo all_done > /tmp/final_all_done
