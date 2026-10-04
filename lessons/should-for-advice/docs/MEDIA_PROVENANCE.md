# Media provenance and licences (corrected)

This file supersedes the licence wording in README.md and docs/QC_REPORT.md of earlier builds, which called the whole narration pipeline "Apache-2.0". That was too broad. The components are separate and carry separate licences.

## What the archive ships, and what it does not
* Ships: 265 narration/dialogue MP3 clips (`narration/clips/`), the lesson source, the script that generated them (`tools/gen-narration.py`), the logo (as supplied by the owner), fonts (OFL, @fontsource), generated IPA lexicon.
* Does NOT ship: the Kokoro model file, the voices file, kokoro-onnx, phonemizer, eSpeak-NG or any other synthesis runtime. They were used on a local machine to produce the MP3s and are not redistributed here.

## Components used to make the MP3s (kept separate)
| Component | Licence | Reference (supplied by the owner's independent QA; not re-fetched by me) |
|---|---|---|
| `kokoro-onnx` 0.6.1 (Python wrapper) | **MIT**, verified by the QA reviewer inside the exact PyPI sdist (SHA256 `7bbdb66dd53775f71088a99999a9aefdad240740daf54cb09410d8bb1e294e35`) | https://pypi.org/project/kokoro-onnx/0.6.1/ ; https://github.com/thewh1teagle/kokoro-onnx/blob/model-files-v1.0/LICENSE |
| Original Kokoro-82M model and voices (hexgrad) | **Apache-2.0** as declared in the model repository README and VOICES.md at the pinned revision | https://huggingface.co/hexgrad/Kokoro-82M/blob/f3ff3571791e39611d31c381e3a41a3af07b4987/README.md ; .../VOICES.md ; Apache text: https://www.apache.org/licenses/LICENSE-2.0 |
| ONNX conversion code | **MIT** | https://github.com/taylorchu/kokoro-onnx/blob/850d169e113d629fa9c50d79bce95815e025ece3/LICENSE |
| phonemizer / eSpeak-NG (phoneme step) | GPL obligations apply if that runtime/code is redistributed. Not distributed in this archive. This does not by itself licence or restrict the MP3 output; no legal conclusion is drawn here. | – |
| wrapper `trim.py` | preserves a librosa permissive copyright notice; keep that notice if that source is ever redistributed | – |

No claim of verified commercial clearance is made from the voice IDs or from this table. Whether the generated audio may be used commercially is a question for the owner/counsel using the primary sources above.

## Hashes of the model files
The model and voices hashes recorded when the audio was made are:
* model `kokoro-v1.0.onnx`: 7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5
* voices `voices-v1.0.bin`: bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d

Status: **recorded at generation time and publicly corroborated; NOT re-hashed locally for this repair** because the binaries are absent from the working environment. Nothing was downloaded or installed for this documentation.

## Recorded media in this repair (compared with the audited build)
* 261 of the 265 MP3 clips are byte-identical to the audited build (SHA-256 compared against `baseline/SHA256SUMS-before-audit.txt`).
* 4 narrator closing-comment clips were intentionally replaced because their text changed to follow the facts-based mission model (removed ids 67098503, 7a2f9863, 8ac1b833, fa97a2c8; added ids e7376cb9, 18aa83d4, 81492989, f10f6fb1). Synthesised locally with the same pipeline as the rest.
* Logo `assets/fluent_english_logo_720.png` unchanged (hash in the baseline sums).
* No audio pronunciation or emotion was verified by ASR or listening in this repair.
* Weak-form clip ("You should call her.") is rendered from an explicit phoneme string; its audio was not verified by ear.
