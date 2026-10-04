#!/usr/bin/env python3
"""METADATA_REV2 packaging (no rendering, no media change). Builds: two per-batch METADATA_REV2 ZIPs, the canonical 12-video ZIP, logical recovery parts (< 20 MB each) and the member-hash index.
Usage: python3 build/package_metadata_rev2.py   (run from marketing_oct03_v2/ or repo root)"""
import os, sys, json, zipfile, hashlib, shutil
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); B = 'marketing_oct03_v2/'
DIST = os.path.join(ROOT, B, 'dist'); FIN = os.path.join(DIST, 'final_canonical'); os.makedirs(FIN, exist_ok=True)
sha = lambda p: hashlib.sha256(open(os.path.join(ROOT, p), 'rb').read()).hexdigest()
idx = json.load(open(os.path.join(ROOT, B, 'manifest/final_inputs/current_video_index.json')))
CUR = idx['current_videos']
def walk(d, skip=()):
    out = []
    for dp, dn, fs in os.walk(os.path.join(ROOT, d)):
        dn[:] = [x for x in dn if x not in ('tmp', 'node_modules', '__pycache__', '.git')]
        for f in fs: out.append(os.path.relpath(os.path.join(dp, f), ROOT))
    return [p for p in out if not any(s in p for s in skip)]
def build_zip(path, members, stored_ext=('.mp4', '.mp3', '.png')):
    if os.path.exists(path): os.remove(path)
    with zipfile.ZipFile(path, 'w') as z:
        for arc, src in members:
            zi = zipfile.ZipInfo.from_file(os.path.join(ROOT, src) if isinstance(src, str) else src[0], arc) if False else None
            comp = zipfile.ZIP_STORED if arc.lower().endswith(stored_ext) else zipfile.ZIP_DEFLATED
            z.write(os.path.join(ROOT, src), arc, compress_type=comp, compresslevel=6 if comp == zipfile.ZIP_DEFLATED else None)
    return os.path.getsize(path)
# ---------- per-batch METADATA_REV2 ZIPs (same recipe as the earlier batch ZIPs + corrected metadata) ----------
def batch_members(tag, qa_prefixes, orig_prefixes, cue_prefixes, skip_manifest_inputs):
    m = []
    m += [f for f in walk(B + 'out') if tag in os.path.basename(f) and os.path.basename(f).startswith('FE26')]
    for d in ['src', 'build', 'assets', 'manifest', 'qa/' + tag + '_frames']:
        m += [f for f in walk(B + d) if not any(s in f for s in skip_manifest_inputs)]
    m += [B + 'qa/' + f for f in os.listdir(os.path.join(ROOT, B, 'qa')) if os.path.isfile(os.path.join(ROOT, B, 'qa', f)) and f.startswith(qa_prefixes)]
    m += [B + 'audio/originals/' + f for f in os.listdir(os.path.join(ROOT, B, 'audio/originals')) if f.startswith(orig_prefixes)]
    m += [B + 'audio/cues/' + f for f in os.listdir(os.path.join(ROOT, B, 'audio/cues')) if f.startswith(cue_prefixes)]
    m += [B + 'README.md', 'CLAUDE.md', '.claude/skills/video-production/SKILL.md']
    m = [p for p in m if '_hold_' not in p]
    return sorted(set(m))
def write_batch(name, tag, qa_p, o_p, c_p, skip):
    mem = batch_members(tag, qa_p, o_p, c_p, skip); out = os.path.join(DIST, name)
    lines = [sha(p) + '  ' + p for p in mem if p.startswith((B + 'out/', B + 'audio/originals/')) or p.endswith('.mp4')]
    tmp = os.path.join(DIST, '_sums_' + tag + '.txt'); open(tmp, 'w').write('\n'.join(lines) + '\n')
    members = [(p, p) for p in mem] + [(B + 'SHA256SUMS_' + tag + '_METADATA_REV2.txt', os.path.relpath(tmp, ROOT))]
    size = build_zip(out, members); os.remove(tmp); return out, size, len(mem)
if 'batches' in sys.argv or len(sys.argv) == 1:
    r2 = write_batch('October_batch2_METADATA_REV2_QA-pending_current_deliverables.zip', 'batch2', ('FE261019', 'FE261021', 'FE261023', 'batch2_', 'clarify_deadline', 'tell_me_more', 'private_company', 'METADATA_REV2'), ('clarify_deadline', 'tell_me_more', 'private_company'), ('clarify_deadline', 'tell_me_more', 'private_company'), ('manifest/batch1_inputs', 'manifest/batch3_inputs', 'asr_handoff'))
    r3 = write_batch('October_batch3_METADATA_REV2_QA-pending_current_deliverables.zip', 'batch3', ('FE261026', 'FE261028', 'FE261030', 'batch3_', 'since_for', 'used_to', 'trial_faq', 'METADATA_REV2'), ('since_for', 'used_to', 'trial_faq'), ('since_for', 'used_to', 'trial_faq'), ('manifest/batch1_inputs', 'manifest/batch2_inputs', 'asr_handoff'))
    for r in (r2, r3): print(r[0], round(r[1] / 2**20, 2), 'MiB', r[2], 'members')
# ---------- canonical ----------
EXCL_QA = ('PREVIEW', 'FINAL-CANDIDATE', 'REV2_narrated', 'I-AGREE_REV2', 'actually_currently_oct03_v2_REV3', 'looking_forward_to_oct03_v2_REV3', 'batch1_single-host', 'FE261012-CANHAVE_ffprobe', 'FE261014-BORROW_ffprobe', 'FE261016-SCHEDULE_ffprobe', 'batch1_verification_report', 'short_3.6')
def canonical_members():
    m = []
    cur_files = {v['filename'] for v in CUR}
    for f in sorted(os.listdir(os.path.join(ROOT, B, 'out'))):
        if f in cur_files: m.append(B + 'out/' + f)
    stems = [f[:-4] for f in cur_files]
    caps = []
    for f in sorted(os.listdir(os.path.join(ROOT, B, 'out'))):
        if f.endswith(('.srt', '.vtt', '_caption_status.txt')):
            ok = any(f.startswith(x) for x in ('i_agree_oct03_v2_REV3_captions', 'actually_currently_oct03_v2_REV4_captions', 'looking_forward_to_oct03_v2_REV4_captions', 'FE261012-CANHAVE_batch1_REV2_captions', 'FE261014-BORROW_batch1_REV2_captions', 'FE261016-SCHEDULE_batch1_REV2_captions', 'FE261019-CLARIFY_batch2', 'FE261021-MORE_batch2_captions', 'FE261023-PRIVATE_batch2_captions', 'FE261026-SINCEFOR_batch3_captions', 'FE261028-USED_batch3_captions', 'FE261030-TRIALFAQ_batch3_captions'))
            if ok: caps.append(B + 'out/' + f)
    m += caps
    for d in ['src', 'build', 'assets', 'manifest']: m += walk(B + d)
    m += [B + 'audio/originals/' + f for f in sorted(os.listdir(os.path.join(ROOT, B, 'audio/originals')))]
    m += [B + 'audio/cues/' + f for f in sorted(os.listdir(os.path.join(ROOT, B, 'audio/cues')))]
    for f in sorted(os.listdir(os.path.join(ROOT, B, 'qa'))):
        p = os.path.join(ROOT, B, 'qa', f)
        if os.path.isfile(p) and not any(x in f for x in EXCL_QA) and not f.endswith('.mp4'): m.append(B + 'qa/' + f)
    m += [B + 'README.md', 'CLAUDE.md', '.claude/skills/video-production/SKILL.md']
    bad = [p for p in m if p.endswith('.mp4') and os.path.basename(p) not in cur_files]
    assert not bad, bad
    m = [p for p in m if not p.endswith('.zip') and '/dist/' not in p]
    return sorted(set(m))
def group_of(p):
    n = os.path.basename(p)
    if p.endswith('.mp4'):
        v = next(x for x in CUR if x['filename'] == n); return {'1': 'media_a_first3', '2': 'media_b_batch1_REV2', '3': 'media_c_batch2', '4': 'media_d_batch3'}[('1' if v['content_id'] in ('FE261003-AGREE', 'FE261005-ACTUALLY', 'FE261007-FORWARD') else '2' if 'batch1' in v['revision'] else '3' if 'batch2' in v['revision'] else '4')]
    if '/audio/originals/' in p: return 'audio_originals'
    if '/audio/cues/' in p: return 'audio_cues_1' if sum(ord(c) for c in n) % 2 == 0 else 'audio_cues_2'
    return 'source_qa_captions_manifests'
if 'canonical' in sys.argv or len(sys.argv) == 1:
    members = canonical_members(); PFX = 'fluent_english_oct2026_canonical/'
    entries = {p: {'sha256': sha(p), 'bytes': os.path.getsize(os.path.join(ROOT, p)), 'part': group_of(p)} for p in members}
    # common readable index files (repeated in every part)
    ci = json.loads(json.dumps(idx)); ci['canonical_archive'] = 'fluent_english_oct2026_canonical.zip'
    for v in ci['current_videos']: v['archive_path'] = PFX + B + 'out/' + v['filename']; v['sha256_verified_in_archive'] = entries[B + 'out/' + v['filename']]['sha256'] == v['sha256']
    assert all(v['sha256_verified_in_archive'] for v in ci['current_videos'])
    rows = '\n'.join(f"| {v['content_id']} | {v['title']} | {v['revision']} | `{v['filename']}` | {v['duration_seconds']} s | {v['sha256']} | [private preview]({v['drive_url']}) | {', '.join(v['platform_scope'])} |" for v in CUR)
    readme = f"""# Fluent English - October 2026: canonical current 12-video package (QA-status snapshot)

**This is a QA-status snapshot, not a scheduling receipt.** Facebook/TikTok scheduling is managed separately and no live scheduling count is asserted. Index as of {idx['as_of_utc']}.

## Current media (exact bytes; SHA256 = supplied index = archived file)
| Content ID | Title | Revision | File (`{PFX}{B}out/`) | Duration | SHA256 | Private Drive preview (owner-only; reference only, NOT fetched) | Platform scope |
|---|---|---|---|---|---|---|---|
{rows}

Drive links are verified owner-only references supplied with the index; they were not fetched or browsed. All 12 preview copies were raw-readback hash verified by the supplier.

## Status and open gates
- All 12 pass independent visual and technical checks within documented coverage (batch1 REV2: 501 whole frames/21 native caption crops/4 native stills; batch2: 498/26/11; batch3: 510/28/12). Independent review was performed by an external reviewer, not by the assistant that built the videos.
- **Genuine listening and a full subjective AV pass are UNRUN for every video.** The owner said the voice sounds good; that is owner feedback, not an assistant hearing audit. No pronunciation/naturalness approval is claimed.
- **Clarify (FE261019): the Spanish "por" vs ASR "for" (source 14.2-15.2 s = final 16.55-17.55 s) is UNRESOLVED**; the caption keeps the script word and is PROVISIONAL.
- Native-platform coverage is partial per video; no universal mobile-overlay, disclosure or scheduling pass is claimed. Instagram native AI disclosure is held. No video is scheduled by this package.
- No IPA was added and none of these 12 videos is to be re-rendered (selective IPA is for future pronunciation-focused clips only).
- Batch1 Borrow/Schedule manifests still carry the CanHave-era wording in `confidence.wordLevel` (documentation only, untouched here).

## Contents
`{B}out/` current MP4s + captions of the current revisions | `{B}src`, `{B}build`, `{B}assets` reproducible source (Node/Playwright/ffmpeg pipeline; see `{B}README.md`, `.claude/skills/video-production/SKILL.md`) | `{B}audio/originals` every supplied Luis original (SHA256SUMS*.txt) | `{B}audio/cues` exact sample-partition cue WAVs | `{B}manifest` cue/alignment/retimed manifests and supplied inputs (incl. `manifest/final_inputs`) | `{B}qa` current reports (REV3, REV4, batch1 REV2, batch2/3 METADATA_REV2; historical reports marked), edit maps (source -> final), verification JSON.
Excluded: .git, .env/secrets, caches, node_modules, historical duplicate MP4s, nested ZIPs, long-lesson files, dense frame-evidence folders (referenced by the owner's Drive evidence).

## Integrity
`ARCHIVE_MEMBER_HASHES.json` lists the SHA256, size and recovery part of every archive member (except itself). `SHA256SUMS_CURRENT_MEDIA_AND_ORIGINALS.txt` lists the 12 MP4s and all originals. Recovery parts (each < 20 MB) repeat only this README, CURRENT_VIDEO_INDEX.json and ARCHIVE_MEMBER_HASHES.json; their union reproduces every canonical member byte-for-byte (`RECOVERY_PARTS_MANIFEST.json`).
"""
    sums = '\n'.join(f"{entries[p]['sha256']}  {p}" for p in members if p.endswith('.mp4') or '/audio/originals/' in p) + '\n'
    tmpd = os.path.join(DIST, '_idx'); os.makedirs(tmpd, exist_ok=True)
    open(os.path.join(tmpd, 'README_CANONICAL_INDEX.md'), 'w').write(readme); json.dump(ci, open(os.path.join(tmpd, 'CURRENT_VIDEO_INDEX.json'), 'w'), indent=2, ensure_ascii=False)
    open(os.path.join(tmpd, 'SHA256SUMS_CURRENT_MEDIA_AND_ORIGINALS.txt'), 'w').write(sums)
    json.dump({'note': 'SHA256/size of every canonical archive member except this file; "part" is the recovery ZIP that holds it. Paths are relative to the archive root folder ' + PFX, 'archive_root': PFX, 'member_count': len(entries), 'members': entries}, open(os.path.join(tmpd, 'ARCHIVE_MEMBER_HASHES.json'), 'w'), indent=1)
    common = ['README_CANONICAL_INDEX.md', 'CURRENT_VIDEO_INDEX.json', 'ARCHIVE_MEMBER_HASHES.json']; extra = ['SHA256SUMS_CURRENT_MEDIA_AND_ORIGINALS.txt']
    ZP = lambda p: os.path.relpath(os.path.join(tmpd, p), ROOT)
    full = [(PFX + p, p) for p in members] + [(PFX + c, ZP(c)) for c in common + extra]
    cz = os.path.join(FIN, 'fluent_english_oct2026_canonical.zip'); csz = build_zip(cz, full)
    parts = {}
    for p, e in entries.items(): parts.setdefault(e['part'], []).append(p)
    pinfo = {}
    for g, mem in sorted(parts.items()):
        pz = os.path.join(FIN, f'fluent_english_oct2026_recovery_{g}.zip'); sz = build_zip(pz, [(PFX + p, p) for p in mem] + [(PFX + c, ZP(c)) for c in common])
        pinfo[g] = {'file': os.path.basename(pz), 'bytes': sz, 'sha256': hashlib.sha256(open(pz, 'rb').read()).hexdigest(), 'members': len(mem)}
        print(g, sz, 'bytes', len(mem), 'members', 'OK' if sz < 20_000_000 else 'TOO BIG')
    # verification: union of parts == canonical members byte-for-byte
    seen = {}
    for g, i in pinfo.items():
        with zipfile.ZipFile(os.path.join(FIN, i['file'])) as z:
            for n in z.namelist():
                if n[len(PFX):] in common: continue
                seen.setdefault(n[len(PFX):], []).append(hashlib.sha256(z.read(n)).hexdigest())
    ok = set(seen) == set(entries) and all(len(v) == 1 and v[0] == entries[k]['sha256'] for k, v in seen.items())
    with zipfile.ZipFile(cz) as z:
        czh = {n[len(PFX):]: hashlib.sha256(z.read(n)).hexdigest() for n in z.namelist()}
    ok2 = all(czh.get(k) == e['sha256'] for k, e in entries.items())
    print('parts union == canonical members byte-for-byte:', ok, '| canonical zip members match hash index:', ok2, '| members', len(entries))
    json.dump({'canonical_zip': {'file': os.path.basename(cz), 'bytes': csz, 'sha256': hashlib.sha256(open(cz, 'rb').read()).hexdigest(), 'members': len(czh)}, 'recovery_parts': pinfo, 'union_verified_byte_for_byte': ok and ok2, 'common_files_repeated_in_every_part': common, 'index_sha256': {c: hashlib.sha256(open(os.path.join(tmpd, c), 'rb').read()).hexdigest() for c in common + extra}, 'status': 'QA-status snapshot; not a scheduling receipt'}, open(os.path.join(FIN, 'RECOVERY_PARTS_MANIFEST.json'), 'w'), indent=2)
    for c in common + extra: shutil.copy(os.path.join(tmpd, c), os.path.join(FIN, c))
    shutil.rmtree(tmpd); print('canonical', round(csz / 2**20, 2), 'MiB'); assert ok and ok2
