#!/usr/bin/env python3
"""Assembles the final export: lesson HTML + source (after/before-v4) + unified patch + QA outputs + SHA-256 manifest, and the contact-sheet archive."""
import zipfile, subprocess, os, io, tarfile, hashlib, sys, json, datetime
repo = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); out = sys.argv[1]; os.makedirs(out, exist_ok=True)
tag = 'lesson-v4-baseline-before-improvement-pass'; day = datetime.date.today().isoformat()
patch = subprocess.run(['git', '-C', repo, 'diff', '--no-color', tag, '--', 'lesson/src', 'lesson/build', 'lesson/README.md'], capture_output=True, text=True).stdout
# untracked files are not in `git diff`; add them as new-file hunks via --no-index against /dev/null
untracked = subprocess.run(['git', '-C', repo, 'ls-files', '--others', '--exclude-standard', 'lesson/src', 'lesson/build'], capture_output=True, text=True).stdout.split()
for f in untracked: patch += subprocess.run(['git', '-C', repo, 'diff', '--no-color', '--no-index', '/dev/null', f], capture_output=True, text=True).stdout
open(f'{out}/source-before-after.patch', 'w').write(patch)
def sha(p): return hashlib.sha256(open(p, 'rb').read()).hexdigest()
html = f'{repo}/lesson/fluent-english-be-lesson.html'
name = f'fluent-english-be-lesson_source-and-tests_{day}.zip'; z = zipfile.ZipFile(f'{out}/{name}', 'w', zipfile.ZIP_DEFLATED)
z.write(html, 'fluent-english-be-lesson.html'); z.write(f'{out}/source-before-after.patch', 'source/source-before-after.patch')
for base in ['lesson/src', 'lesson/build']:
    for root, _, files in os.walk(f'{repo}/{base}'):
        for f in files:
            if f in ('arttest.html', 'handtest.html') or f.endswith('.png'): continue
            p = os.path.join(root, f); z.write(p, 'source/after/' + os.path.relpath(p, repo))
z.write(f'{repo}/lesson/README.md', 'source/after/lesson/README.md')
tb = subprocess.run(['git', '-C', repo, 'archive', tag, 'lesson/src', 'lesson/build', 'lesson/README.md'], capture_output=True).stdout
for m in (t := tarfile.open(fileobj=io.BytesIO(tb))).getmembers():
    if m.isfile(): z.writestr('source/before-v4/' + m.name, t.extractfile(m).read())
z.write(f'{repo}/lesson/versions/lesson-v4-baseline.html', 'baselines/lesson-v4-baseline.html')
for d in ['before', 'after']:
    for f in sorted(os.listdir(f'{repo}/qa/{d}')):
        p = f'{repo}/qa/{d}/{f}'
        if os.path.isfile(p) and f.endswith(('.txt', '.json', '.md')): z.write(p, f'qa/{d}/{f}')
z.writestr('README-BUNDLE.txt', f'''Fluent English - Subject Pronouns and Be (A1) - final repaired lesson bundle ({day})
fluent-english-be-lesson.html        repaired, self-contained lesson (Chrome/Edge; click Start Lesson)
baselines/lesson-v4-baseline.html    unchanged build from before this pass (v1-v3 + tags are in the repo)
source/after/                        current source (lesson/src) + tools/tests (lesson/build); rebuild: node lesson/build/build.js
source/before-v4/                    source exactly as of the baseline tag
source/source-before-after.patch     unified diff (new files included)
qa/before, qa/after                  raw test/audit outputs, QA-REPORT.md, machine-readable inventory.json, ipa-corpus.json
Tests: npm i playwright && npx playwright install chromium (or set PW_CHROMIUM); run node lesson/build/test-regression.js [html] etc. See lesson/build/run-qa.sh.
SHA-256 of every deliverable is in HASHES.txt (delivered alongside).
''')
z.close()
# contact sheets archive
sheets = f'{repo}/qa/after/contact-sheets'; zs = zipfile.ZipFile(f'{out}/fluent-english-contact-sheets_{day}.zip', 'w', zipfile.ZIP_STORED)
for f in sorted(os.listdir(sheets)):
    if f.endswith('.png'): zs.write(os.path.join(sheets, f), f)
zs.close()
rows = []
for f, p in [('fluent-english-be-lesson.html', html), (name, f'{out}/{name}'), (f'fluent-english-contact-sheets_{day}.zip', f'{out}/fluent-english-contact-sheets_{day}.zip'), ('QA-REPORT.md', f'{repo}/qa/after/QA-REPORT.md'), ('inventory.json', f'{repo}/qa/after/inventory.json'), ('source-before-after.patch', f'{out}/source-before-after.patch'), ('Sound_Chart.mp4 (original, unaltered)', f'{repo}/lesson/assets/original/Sound_Chart.mp4')] + [(f'contact-sheets/{f}', os.path.join(sheets, f)) for f in sorted(os.listdir(sheets)) if f.endswith('.png')]:
    rows.append(f'{sha(p)}  {os.path.getsize(p):>10}  {f}')
open(f'{out}/HASHES.txt', 'w').write('SHA-256  bytes  file\n' + '\n'.join(rows) + '\n'); print('\n'.join(rows[:8]))
