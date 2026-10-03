# Environment report (tested 2026-10-03)

## What this session is
Claude Code **cloud execution container** (Linux VM), not an ordinary chat. It can run commands, write files, and commit/push to the GitHub branch `claude/inspiring-johnson-jv0rkc`. Files reach you through that branch (download from GitHub); nothing is rendered on your PC.

## Measured hardware / limits
| Item | Result |
|---|---|
| CPU | 4 vCPU |
| RAM | 15 GiB, no swap |
| GPU | **None** (no /dev/dri, no nvidia-smi) |
| Disk | ~30 GB free |
| Python / Node / FFmpeg | 3.11.15 / 22 / present |

## Network policy (the key constraint)
Reachable: PyPI, npm, the repo. **Blocked (403 by egress proxy):** download.blender.org, oxfordlearnersdictionaries.com (shell *and* WebFetch), polyhaven.com, huggingface.co, freesound.org, opengameart.org, fonts.google.com, cdn.jsdelivr.net, github.com release downloads.
Consequences: no Oxford lookups, no Poly Haven HDRIs/textures, no downloadable character packs, no Hugging Face TTS voices.

## Blender
- Official Blender download is blocked, but the PyPI wheel **`bpy` 5.0.1** (Blender-as-a-module) installs and runs headless. **Works.**
- **Cycles (CPU): works.** 960x540, 32 spp, denoised: **15.4 s/frame**. 1920x1080, 64 spp: **111 s/frame**.
- **Eevee: runs only via software GL** (libEGL installed, EGL_BAD_MATCH warnings, llvmpipe): 31 s at 960x540, 16 spp - slower than Cycles here. Not recommended in this container.
- Scaling: a 25 s sample at 24 fps = 600 frames -> ~2.5 h at 540p, ~18 h at 1080p/64spp on this machine. A full multi-clip episode is not realistic here at 1080p. Your Windows PC (especially with an NVIDIA GPU + Cycles OptiX, or Eevee) is the right place for final renders. **I will ask before you start any local render.**
- bpy licence: GPL-3.0-or-later. Blender output (images/video) you render is yours.

## Voices
- No natural free TTS is reachable: Piper/Kokoro packages download from PyPI, but their voice models live on Hugging Face/GitHub (blocked). Espeak-class robotic voices would violate the "natural adult American voices" requirement, so I did **not** use them.
- Plan: recording script + timestamped placeholders for your own recordings (or you generate voices locally under licences you verify). Nothing is voiced yet.

## Money
No paid API, plugin, asset, or hosting was used or required. Everything so far ran on the free PyPI/Python tooling.

## Not yet verified
Browser playback performance on your teaching PC; Windows Blender version; your GPU.
