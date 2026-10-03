# Asset licence manifest - status: PROVISIONAL (not cleared for public release)

Every asset below was retrieved from a public registry reachable from this container. Licence statements are quoted from the files themselves. **I could not open makehuman.org (blocked), so nothing here is verified against MakeHuman's own licence pages.**

| Asset | Source (how fetched) | Licence stated in the file | Status |
|---|---|---|---|
| Body-shape / macro / expression targets (`targets.npz`) | PyPI `makehuman` 1.3.2 wheel | `targets/targets.license`: "author MakeHuman Team, licence **CC0**, (c) makehumancommunity.org 2001-2020" | **Verified in file: CC0** |
| Base mesh `human_full_size.json` (hm08 base.obj) | npm `makehuman-data` 0.0.2 (third-party repack by "wassname") | JSON metadata: "**AGPL3** (see also makehuman.org/doc/node/external_tools_license.html)", (c) MakeHuman.org 2001-2015 | **Unclear** - AGPL3 notice; MakeHuman historically states exported models are CC0, but I could not read that page |
| Default skeleton + weights (`rigs/default.json`) | same npm package | "GNU Affero General Public License 3", (c) Manuel Bastioni 2014 | **AGPL3 as stated** |
| Hair, eyebrows, eyelashes, eyes, teeth, tongue, clothes proxies | same npm package | Per-file metadata: "AGPL3 ... (c) MakeHuman.org 2001-2015" (checked: hair `short02`; others not individually audited) | **Not individually audited** |
| Skin textures (`skins/*/textures`) | same npm package | no licence in files | **Unknown** |
| Hair/cloth textures | same npm package | no licence in files | **Unknown** |
| Blender / `bpy` 5.0.1 | PyPI | GPL-3.0-or-later (tool); rendered output belongs to the creator | OK as a tool |
| Everything procedural (room, materials, lights) | written in this repo | project's own | OK |

## What this means for you
- The renders in this test are fine as an internal technical test.
- **Before any classroom/commercial use:** read https://www.makehuman.org/doc/node/external_tools_license.html and the licence of each skin/clothes/hair asset. If you send me that text (or confirm in writing which assets you accept), I will update this table. If any asset is not acceptable I will replace it or rebuild it from CC0-only parts (targets are the only verified-CC0 part).
- AGPL concerns *distribution of the asset/code*, not the video frames. The video itself would not carry source-disclosure duties in my reading, but that is a legal question I cannot settle; treat it as unresolved.
- The assets are deliberately **not committed** to this repository; `tools/fetch_assets.sh` re-downloads them.
