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
  background_image_url: string;
  layout_type?: string;
  logo_position?: string;
  output_format?: string;
  aspect_ratio?: string;
  speech_bubbles?: SpeechBubble[];
}

function convertGDriveUrl(url: string): string {
  const match = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
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

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildMainTitleSvg(words: string[], ipas: string[]): string {
  const fontSize = 52;
  const ipaFontSize = 18;
  const wordSpacing = 18;
  const topY = 52;

  const approxCharWidth = fontSize * 0.55;
  const wordWidths = words.map((w) => w.length * approxCharWidth + 8);
  const totalWidth =
    wordWidths.reduce((a, b) => a + b, 0) + wordSpacing * (words.length - 1);
  let x = (WIDTH - totalWidth) / 2;

  const parts: string[] = [];

  words.forEach((word, i) => {
    const cx = x + wordWidths[i] / 2;

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
          x="${cx}" y="${topY + fontSize + 8 + ipaFontSize}"
          font-family="Georgia, serif" font-size="${ipaFontSize}"
          text-anchor="middle"
          stroke="rgba(0,0,0,0.6)" stroke-width="3" paint-order="stroke"
          fill="white"
        >${escapeXml(ipas[i])}</text>
      `);
    }

    x += wordWidths[i] + wordSpacing;
  });

  return parts.join("\n");
}

function getBubbleBounds(position: string): {
  x: number;
  y: number;
  w: number;
  h: number;
} {
  const bw = 560;
  const bh = 220;
  const margin = 28;
  const topY = 158;
  const bottomY = HEIGHT - bh - margin;

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
  const tailSize = 16;
  if (position === "top-left" || position === "top-right") {
    const tx = position === "top-left" ? bx + 36 : bx + bw - 36;
    return `M ${tx - tailSize} ${by + bh} L ${tx + tailSize} ${by + bh} L ${tx} ${by + bh + tailSize} Z`;
  } else {
    const tx = position === "bottom-left" ? bx + 36 : bx + bw - 36;
    return `M ${tx - tailSize} ${by} L ${tx + tailSize} ${by} L ${tx} ${by - tailSize} Z`;
  }
}

function buildBubbleSvg(bubble: SpeechBubble): string {
  const { x, y, w, h } = getBubbleBounds(bubble.position);
  const padding = 18;
  const radius = 16;
  const tailPath = buildBubbleTailPath(x, y, w, h, bubble.position);

  const wordFontSize = 15;
  const ipaFontSize = 11;
  const rowHeight = wordFontSize + 4 + ipaFontSize + 8;
  const wordGap = 7;

  const textStartX = x + padding + 36;
  const textMaxWidth = w - padding * 2 - 36;
  const textStartY = y + padding + 22;

  const approxCharWidth = wordFontSize * 0.58;
  const wordWidths = bubble.words.map((w) => w.length * approxCharWidth + 4);

  const lines: number[][] = [];
  let currentLine: number[] = [];
  let currentWidth = 0;
  bubble.words.forEach((_, i) => {
    const needed = wordWidths[i] + (currentLine.length > 0 ? wordGap : 0);
    if (currentWidth + needed > textMaxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = [i];
      currentWidth = wordWidths[i];
    } else {
      currentLine.push(i);
      currentWidth += needed;
    }
  });
  if (currentLine.length > 0) lines.push(currentLine);

  const wordParts: string[] = [];

  lines.forEach((lineIndices, li) => {
    const lineWidth = lineIndices.reduce(
      (acc, idx, pos) => acc + wordWidths[idx] + (pos > 0 ? wordGap : 0),
      0
    );
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
          `<rect x="${wx - 2}" y="${baseY - wordFontSize}" width="${ww + 4}" height="${wordFontSize + 4}" fill="rgba(255,220,0,0.85)" rx="2"/>`
        );
      }

      wordParts.push(
        `<text x="${wx}" y="${baseY}" font-family="sans-serif" font-size="${wordFontSize}" font-weight="${isHighlight ? "bold" : "normal"}" fill="#111111" text-anchor="start">${escapeXml(word)}</text>`
      );

      if (ipa) {
        wordParts.push(
          `<text x="${wx}" y="${baseY + 4 + ipaFontSize}" font-family="Georgia, serif" font-size="${ipaFontSize}" fill="#555555" text-anchor="start">${escapeXml(ipa)}</text>`
        );
      }

      wx += ww + wordGap;
    });
  });

  return `
    <g filter="url(#bubbleShadow)">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" ry="${radius}" fill="rgba(255,255,255,0.96)" stroke="#cccccc" stroke-width="1.5"/>
      <path d="${tailPath}" fill="rgba(255,255,255,0.96)"/>
    </g>
    <circle cx="${x + padding + 14}" cy="${y + padding + 10}" r="13" fill="#1565C0"/>
    <text x="${x + padding + 14}" y="${y + padding + 15}" font-family="sans-serif" font-size="13" font-weight="bold" fill="white" text-anchor="middle">${bubble.number}</text>
    ${wordParts.join("\n")}
  `;
}

function buildOverlaySvg(body: SlideRequest): string {
  const titleWords = body.main_title_words ?? body.main_title.split(" ");
  const titleIPA = body.main_title_ipa ?? titleWords.map(() => "");

  const bubblesSvg = (body.speech_bubbles ?? [])
    .map((b) => buildBubbleSvg(b))
    .join("\n");

  // Logo lives at the project root alongside package.json
  const logoPath = path.join(process.cwd(), "fluent_english_logo.png");
  let logoSvg: string;
  if (fs.existsSync(logoPath)) {
    const logoB64 = fs.readFileSync(logoPath).toString("base64");
    logoSvg = `<image href="data:image/png;base64,${logoB64}" x="18" y="14" width="160" height="58"/>`;
  } else {
    logoSvg = `<text x="18" y="42" font-family="sans-serif" font-size="18" font-weight="bold" fill="white" filter="url(#titleShadow)">Fluent English</text>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <filter id="titleShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.55)"/>
    </filter>
    <filter id="bubbleShadow" x="-5%" y="-5%" width="115%" height="120%">
      <feDropShadow dx="2" dy="4" stdDeviation="6" flood-color="rgba(0,0,0,0.25)"/>
    </filter>
  </defs>

  <!-- Dark overlay -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="rgba(0,0,20,0.40)"/>

  <!-- Logo -->
  ${logoSvg}

  <!-- Main title + IPA -->
  ${buildMainTitleSvg(titleWords, titleIPA)}

  <!-- Speech bubbles -->
  ${bubblesSvg}
</svg>`;
}

router.post("/render-slide", async (req: Request, res: Response) => {
  const body = req.body as SlideRequest;

  if (!body.main_title || !body.background_image_url) {
    res
      .status(400)
      .json({ error: "main_title and background_image_url are required" });
    return;
  }

  try {
    let bgSharp: Sharp;

    try {
      const imgBuffer = await downloadImage(body.background_image_url);
      bgSharp = sharp(imgBuffer).resize(WIDTH, HEIGHT, {
        fit: "cover",
        position: "center",
      });
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
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("render-slide failed:", message);
    res.status(500).json({ error: "Failed to render slide", detail: message });
  }
});

export default router;
