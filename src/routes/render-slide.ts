import { Router, type IRouter, type Request, type Response } from "express";
import sharp, { type Sharp } from "sharp";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";

const router: IRouter = Router();

const WIDTH = 1280;
const HEIGHT = 720;

interface SpeechBubble {
number: number;
text: string;
words: string[];
ipa: string[];
highlight_words: string[];
position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

interface SlideRequest {
lesson_id?: string;
topic?: string;
slide_number?: number;
slide_type?: string;
main_title: string;
main_title_words: string[];
main_title_ipa: string[];
background_image_base64?: string;
background_image_mime_type?: string;
background_image_url?: string;
layout_type?: string;
logo_position?: string;
output_format?: string;
aspect_ratio?: string;
speech_bubbles?: SpeechBubble[];
}

function convertGDriveUrl(url: string): string {
const match = url.match(/drive.google.com/file/d/([^/]+)/);
if (match) {
return `https://drive.google.com/uc?export=download&id=${match[1]}`;
}
return url;
}

async function downloadImage(url: string): Promise<Buffer> {
const directUrl = convertGDriveUrl(url);
const response = await axios.get(directUrl, {
responseType: "arraybuffer",
timeout: 15000,
headers: { "User-Agent": "Mozilla/5.0" },
maxRedirects: 5,
});

return Buffer.from(response.data);
}

function decodeBase64Image(base64: string): Buffer {
const strippedBase64 = base64.replace(/^data:[^;]+;base64,/, "");
return Buffer.from(strippedBase64, "base64");
}

function escapeXml(s: string): string {
return String(s)
.replace(/&/g, "&")
.replace(/</g, "<")
.replace(/>/g, ">")
.replace(/"/g, """)
.replace(/'/g, "'");
}

function buildMainTitleSvg(words: string[], ipas: string[]): string {
const fontSize = 54;
const ipaFontSize = 19;
const wordSpacing = 18;
const topY = 50;

const approxCharWidth = fontSize * 0.55;
const wordWidths = words.map((w) => w.length * approxCharWidth + 8);
const totalWidth =
wordWidths.reduce((a, b) => a + b, 0) + wordSpacing * (words.length - 1);

let x = (WIDTH - totalWidth) / 2;
const parts: string[] = [];

words.forEach((word, i) => {
const cx = x + wordWidths[i] / 2;

```
parts.push(`
  <text
    x="${cx}" y="${topY + fontSize}"
    font-family="Georgia, serif" font-size="${fontSize}" font-weight="bold"
    text-anchor="middle"
    stroke="white" stroke-width="5" stroke-linejoin="round"
    paint-order="stroke"
    filter="url(#titleShadow)"
    fill="#1565C0"
  >${escapeXml(word)}</text>
`);

if (ipas[i]) {
  parts.push(`
    <text
      x="${cx}" y="${topY + fontSize + 9 + ipaFontSize}"
      font-family="Georgia, serif" font-size="${ipaFontSize}"
      text-anchor="middle"
      stroke="rgba(0,0,0,0.65)" stroke-width="3" paint-order="stroke"
      fill="white"
    >${escapeXml(ipas[i])}</text>
  `);
}

x += wordWidths[i] + wordSpacing;
```

});

return parts.join("\n");
}

function getBubbleBoundsForSize(
position: string,
bw: number,
bh: number
): {
x: number;
y: number;
w: number;
h: number;
} {
const margin = 46;
const topY = 170;
const bottomY = HEIGHT - bh - 54;

switch (position) {
case "top-left":
return { x: margin, y: topY, w: bw, h: bh };
case "top-right":
return { x: WIDTH - bw - margin, y: topY, w: bw, h: bh };
case "bottom-left":
return { x: margin, y: bottomY, w: bw, h: bh };
case "bottom-right":
return { x: WIDTH - bw - margin, y: bottomY, w: bw, h: bh };
default:
return { x: margin, y: topY, w: bw, h: bh };
}
}

function buildBubbleTailPath(
bx: number,
by: number,
bw: number,
bh: number,
position: string
): string {
const tailSize = 18;

if (position === "top-left" || position === "top-right") {
const tx = position === "top-left" ? bx + 42 : bx + bw - 42;
return `M ${tx - tailSize} ${by + bh} L ${tx + tailSize} ${by + bh} L ${tx} ${by + bh + tailSize} Z`;
}

const tx = position === "bottom-left" ? bx + 42 : bx + bw - 42;
return `M ${tx - tailSize} ${by} L ${tx + tailSize} ${by} L ${tx} ${by - tailSize} Z`;
}

function buildBubbleSvg(bubble: SpeechBubble): string {
const paddingX = 28;
const paddingY = 22;
const numberColumnWidth = 52;
const radius = 18;

const wordFontSize = 25;
const ipaFontSize = 14;
const rowGap = 10;
const rowHeight = wordFontSize + 6 + ipaFontSize + rowGap;
const wordGap = 10;

const minBubbleWidth = 250;
const maxBubbleWidth = 500;

const approxCharWidth = wordFontSize * 0.58;
const wordWidths = bubble.words.map((w) => w.length * approxCharWidth + 4);

const wrapWords = (textMaxWidth: number): number[][] => {
const wrappedLines: number[][] = [];
let currentLine: number[] = [];
let currentWidth = 0;

```
bubble.words.forEach((_, i) => {
  const needed = wordWidths[i] + (currentLine.length > 0 ? wordGap : 0);

  if (currentWidth + needed > textMaxWidth && currentLine.length > 0) {
    wrappedLines.push(currentLine);
    currentLine = [i];
    currentWidth = wordWidths[i];
  } else {
    currentLine.push(i);
    currentWidth += needed;
  }
});

if (currentLine.length > 0) {
  wrappedLines.push(currentLine);
}

return wrappedLines;
```

};

const maxTextWidth = maxBubbleWidth - paddingX * 2 - numberColumnWidth;
const measuredLines = wrapWords(maxTextWidth);

const measuredLineWidths = measuredLines.map((lineIndices) =>
lineIndices.reduce(
(acc, idx, pos) => acc + wordWidths[idx] + (pos > 0 ? wordGap : 0),
0
)
);

const widestLine = Math.max(...measuredLineWidths, 0);

const bubbleWidth = Math.min(
maxBubbleWidth,
Math.max(
minBubbleWidth,
Math.ceil(widestLine + paddingX * 2 + numberColumnWidth)
)
);

const textMaxWidth = bubbleWidth - paddingX * 2 - numberColumnWidth;
const lines = wrapWords(textMaxWidth);

const contentHeight = lines.length * rowHeight - rowGap;
const bubbleHeight = Math.max(92, Math.ceil(contentHeight + paddingY * 2));

const { x, y, w, h } = getBubbleBoundsForSize(
bubble.position,
bubbleWidth,
bubbleHeight
);

const tailPath = buildBubbleTailPath(x, y, w, h, bubble.position);

const textStartX = x + paddingX + numberColumnWidth;
const textStartY = y + (h - contentHeight) / 2 + wordFontSize;

const wordParts: string[] = [];

lines.forEach((lineIndices, li) => {
const lineWidth = lineIndices.reduce(
(acc, idx, pos) => acc + wordWidths[idx] + (pos > 0 ? wordGap : 0),
0
);

```
let wx = textStartX + (textMaxWidth - lineWidth) / 2;
const baseY = textStartY + li * rowHeight;

lineIndices.forEach((idx) => {
  const word = bubble.words[idx];
  const ipa = bubble.ipa[idx] ?? "";
  const isHighlight = bubble.highlight_words.some(
    (hw) => hw.toLowerCase() === word.toLowerCase()
  );
  const ww = wordWidths[idx];

  if (isHighlight) {
    wordParts.push(
      `<rect x="${wx - 5}" y="${baseY - wordFontSize - 3}" width="${ww + 10}" height="${wordFontSize + 8}" fill="rgba(255,220,0,0.92)" rx="5"/>`
    );
  }

  wordParts.push(
    `<text x="${wx}" y="${baseY}" font-family="Arial, Helvetica, sans-serif" font-size="${wordFontSize}" font-weight="${isHighlight ? "bold" : "500"}" fill="#111111" text-anchor="start">${escapeXml(word)}</text>`
  );

  if (ipa) {
    wordParts.push(
      `<text x="${wx}" y="${baseY + 4 + ipaFontSize}" font-family="Georgia, serif" font-size="${ipaFontSize}" fill="#444444" text-anchor="start">${escapeXml(ipa)}</text>`
    );
  }

  wx += ww + wordGap;
});
```

});

return ` <g filter="url(#bubbleShadow)"> <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" ry="${radius}" fill="rgba(255,255,255,0.97)" stroke="rgba(255,255,255,0.70)" stroke-width="1.5"/> <path d="${tailPath}" fill="rgba(255,255,255,0.97)"/> </g>

```
<circle cx="${x + paddingX + 17}" cy="${y + h / 2}" r="18" fill="#1565C0"/>
<text x="${x + paddingX + 17}" y="${y + h / 2 + 6}" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="bold" fill="white" text-anchor="middle">${bubble.number}</text>

${wordParts.join("\n")}
```

`;
}

function buildOverlaySvg(body: SlideRequest): string {
const titleWords = body.main_title_words ?? body.main_title.split(" ");
const titleIPA = body.main_title_ipa ?? titleWords.map(() => "");

const bubblesSvg = (body.speech_bubbles ?? [])
.map((b) => buildBubbleSvg(b))
.join("\n");

const logoPath = path.join(process.cwd(), "fluent_english_logo.png");

let logoSvg: string;

if (fs.existsSync(logoPath)) {
const logoB64 = fs.readFileSync(logoPath).toString("base64");
logoSvg = `<image href="data:image/png;base64,${logoB64}" x="24" y="20" width="260" height="96"/>`;
} else {
logoSvg = `<text x="28" y="70" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="bold" fill="white" filter="url(#titleShadow)">Fluent English</text>`;
}

return `<?xml version="1.0" encoding="UTF-8"?> <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}"> <defs> <filter id="titleShadow" x="-10%" y="-10%" width="120%" height="130%"> <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.55)"/> </filter>

```
<filter id="bubbleShadow" x="-8%" y="-12%" width="124%" height="138%">
  <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="rgba(0,0,0,0.22)"/>
</filter>
```

  </defs>

  <!-- Light readability overlay. Lower opacity keeps the image colorful. -->

  <rect width="${WIDTH}" height="${HEIGHT}" fill="rgba(0,0,20,0.14)"/>

  <!-- Logo -->

${logoSvg}

  <!-- Main title + IPA -->

${buildMainTitleSvg(titleWords, titleIPA)}

  <!-- Speech bubbles -->

${bubblesSvg} </svg>`;
}

router.post("/render-slide", async (req: Request, res: Response) => {
const body = req.body as SlideRequest;

if (!body.main_title || (!body.background_image_base64 && !body.background_image_url)) {
res.status(400).json({
error:
"main_title and either background_image_base64 or background_image_url are required",
});
return;
}

try {
let bgSharp: Sharp;

```
try {
  const imgBuffer = body.background_image_base64
    ? decodeBase64Image(body.background_image_base64)
    : await downloadImage(body.background_image_url as string);

  bgSharp = sharp(imgBuffer)
    .resize(WIDTH, HEIGHT, {
      fit: "cover",
      position: "center",
    })
    .modulate({
      brightness: 1.08,
      saturation: 1.35,
    })
    .sharpen();
} catch {
  bgSharp = sharp({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 3,
      background: { r: 26, g: 42, b: 74 },
    },
  });
}

const overlaySvg = buildOverlaySvg(body);
const overlayBuffer = Buffer.from(overlaySvg, "utf8");

const pngBuffer = await bgSharp
  .composite([{ input: overlayBuffer, top: 0, left: 0 }])
  .png()
  .toBuffer();

res.setHeader("Content-Type", "image/png");
res.setHeader("Content-Length", pngBuffer.length);
res.send(pngBuffer);
```

} catch (err) {
const message = err instanceof Error ? err.message : String(err);
console.error("render-slide failed:", message);
res.status(500).json({ error: "Failed to render slide", detail: message });
}
});

export default router;
