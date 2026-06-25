import { Router, type IRouter, type Request, type Response } from "express";
import sharp, { type Sharp } from "sharp";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";

const router: IRouter = Router();

const WIDTH = 1280;
const HEIGHT = 720;

type BubblePosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface SpeechBubble {
  number: number;
  text: string;
  words: string[];
  ipa: string[];
  highlight_words: string[];
  x?: number;
  y?: number;
  width?: number;
  min_height?: number;
  tail_target_x?: number;
  tail_target_y?: number;
  position?: BubblePosition;
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

interface BubbleBounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Point {
  x: number;
  y: number;
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

function decodeBase64Image(base64: string): Buffer {
  const strippedBase64 = base64.replace(/^data:[^;]+;base64,/i, "");
  return Buffer.from(strippedBase64, "base64");
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
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
          stroke="rgba(0,0,0,0.5)" stroke-width="3" paint-order="stroke"
          fill="white"
        >${escapeXml(ipas[i])}</text>
      `);
    }

    x += wordWidths[i] + wordSpacing;
  });

  return parts.join("\n");
}

function resolveBubbleBounds(
  bubble: SpeechBubble,
  bubbleWidth: number,
  bubbleHeight: number
): BubbleBounds {
  const margin = 36;
  const position = bubble.position ?? "top-left";
  let x: number;
  let y: number;

  if (typeof bubble.x === "number" && typeof bubble.y === "number") {
    x = bubble.x;
    y = bubble.y;
  } else {
    const topY = 166;
    const bottomY = HEIGHT - bubbleHeight - margin;

    switch (position) {
      case "top-right":
        x = WIDTH - bubbleWidth - margin;
        y = topY;
        break;
      case "bottom-left":
        x = margin;
        y = bottomY;
        break;
      case "bottom-right":
        x = WIDTH - bubbleWidth - margin;
        y = bottomY;
        break;
      case "top-left":
      default:
        x = margin;
        y = topY;
        break;
    }
  }

  return {
    x: clamp(x, margin, WIDTH - bubbleWidth - margin),
    y: clamp(y, margin, HEIGHT - bubbleHeight - margin),
    w: bubbleWidth,
    h: bubbleHeight,
  };
}

function getDefaultTailTarget(bounds: BubbleBounds, position?: BubblePosition): Point {
  switch (position) {
    case "top-right":
      return { x: bounds.x + bounds.w - 58, y: bounds.y + bounds.h + 74 };
    case "bottom-left":
      return { x: bounds.x + 58, y: bounds.y - 74 };
    case "bottom-right":
      return { x: bounds.x + bounds.w - 58, y: bounds.y - 74 };
    case "top-left":
    default:
      return { x: bounds.x + 58, y: bounds.y + bounds.h + 74 };
  }
}

function buildDynamicTailPath(bounds: BubbleBounds, target: Point): string {
  const tailHalfWidth = 16;
  const cornerInset = 34;
  const centerX = bounds.x + bounds.w / 2;
  const centerY = bounds.y + bounds.h / 2;
  const dx = target.x - centerX;
  const dy = target.y - centerY;

  if (Math.abs(dx) > Math.abs(dy)) {
    const anchorY = clamp(target.y, bounds.y + cornerInset, bounds.y + bounds.h - cornerInset);
    if (dx < 0) {
      return `M ${bounds.x} ${anchorY - tailHalfWidth} L ${bounds.x} ${anchorY + tailHalfWidth} L ${target.x} ${target.y} Z`;
    }
    return `M ${bounds.x + bounds.w} ${anchorY - tailHalfWidth} L ${bounds.x + bounds.w} ${anchorY + tailHalfWidth} L ${target.x} ${target.y} Z`;
  }

  const anchorX = clamp(target.x, bounds.x + cornerInset, bounds.x + bounds.w - cornerInset);
  if (dy < 0) {
    return `M ${anchorX - tailHalfWidth} ${bounds.y} L ${anchorX + tailHalfWidth} ${bounds.y} L ${target.x} ${target.y} Z`;
  }

  return `M ${anchorX - tailHalfWidth} ${bounds.y + bounds.h} L ${anchorX + tailHalfWidth} ${bounds.y + bounds.h} L ${target.x} ${target.y} Z`;
}

function buildBubbleSvg(bubble: SpeechBubble): string {
  const words = bubble.words?.length ? bubble.words : bubble.text.split(/\s+/).filter(Boolean);
  const ipas = bubble.ipa ?? [];
  const highlights = bubble.highlight_words ?? [];
  const position = bubble.position ?? "top-left";

  const paddingX = 28;
  const paddingY = 24;
  const numberColumnWidth = 56;
  const radius = 20;
  const wordFontSize = 24;
  const ipaFontSize = 14;
  const wordGap = 10;
  const rowGap = 10;
  const rowHeight = wordFontSize + 6 + ipaFontSize + rowGap;
  const minBubbleWidth = 310;
  const maxBubbleWidth = 540;
  const requestedWidth =
    typeof bubble.width === "number" ? clamp(bubble.width, minBubbleWidth, maxBubbleWidth) : undefined;
  const minBubbleHeight = typeof bubble.min_height === "number" ? Math.max(88, bubble.min_height) : 108;

  const approxCharWidth = wordFontSize * 0.58;
  const wordWidths = words.map((w) => w.length * approxCharWidth + 6);

  const wrapWords = (textMaxWidth: number): number[][] => {
    const lines: number[][] = [];
    let currentLine: number[] = [];
    let currentWidth = 0;

    words.forEach((_, i) => {
      const needed = wordWidths[i] + (currentLine.length > 0 ? wordGap : 0);
      if (currentLine.length > 0 && currentWidth + needed > textMaxWidth) {
        lines.push(currentLine);
        currentLine = [i];
        currentWidth = wordWidths[i];
      } else {
        currentLine.push(i);
        currentWidth += needed;
      }
    });

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    return lines.length > 0 ? lines : [[]];
  };

  const maxTextWidth = maxBubbleWidth - paddingX * 2 - numberColumnWidth;
  const measuredLines = wrapWords(maxTextWidth);
  const measuredLineWidths = measuredLines.map((line) =>
    line.reduce((acc, idx, pos) => acc + wordWidths[idx] + (pos > 0 ? wordGap : 0), 0)
  );
  const widestLine = Math.max(...measuredLineWidths, 0);
  const bubbleWidth =
    requestedWidth ??
    Math.min(
      maxBubbleWidth,
      Math.max(minBubbleWidth, Math.ceil(widestLine + paddingX * 2 + numberColumnWidth))
    );
  const textMaxWidth = bubbleWidth - paddingX * 2 - numberColumnWidth;
  const lines = wrapWords(textMaxWidth);
  const contentHeight = lines.length * rowHeight - rowGap;
  const bubbleHeight = Math.max(minBubbleHeight, Math.ceil(contentHeight + paddingY * 2));
  const bounds = resolveBubbleBounds(bubble, bubbleWidth, bubbleHeight);
  const tailTarget =
    typeof bubble.tail_target_x === "number" && typeof bubble.tail_target_y === "number"
      ? { x: clamp(bubble.tail_target_x, 0, WIDTH), y: clamp(bubble.tail_target_y, 0, HEIGHT) }
      : getDefaultTailTarget(bounds, position);
  const tailPath = buildDynamicTailPath(bounds, tailTarget);
  const textStartX = bounds.x + paddingX + numberColumnWidth;
  const textStartY = bounds.y + (bounds.h - contentHeight) / 2 + wordFontSize;

  const wordParts: string[] = [];

  lines.forEach((lineIndices, lineIndex) => {
    const lineWidth = lineIndices.reduce(
      (acc, idx, pos) => acc + wordWidths[idx] + (pos > 0 ? wordGap : 0),
      0
    );
    let wx = textStartX + (textMaxWidth - lineWidth) / 2;
    const baseY = textStartY + lineIndex * rowHeight;

    lineIndices.forEach((idx) => {
      const word = words[idx];
      const ipa = ipas[idx] ?? "";
      const isHighlight = highlights.some((hw) => hw.toLowerCase() === word.toLowerCase());
      const wordWidth = wordWidths[idx];

      if (isHighlight) {
        wordParts.push(
          `<rect x="${wx - 4}" y="${baseY - wordFontSize - 2}" width="${wordWidth + 8}" height="${wordFontSize + 7}" fill="rgba(255,220,0,0.88)" rx="5"/>`
        );
      }

      wordParts.push(
        `<text x="${wx}" y="${baseY}" font-family="sans-serif" font-size="${wordFontSize}" font-weight="${isHighlight ? "bold" : "600"}" fill="#101820" text-anchor="start">${escapeXml(word)}</text>`
      );

      if (ipa) {
        wordParts.push(
          `<text x="${wx}" y="${baseY + 6 + ipaFontSize}" font-family="Georgia, serif" font-size="${ipaFontSize}" fill="#4A5568" text-anchor="start">${escapeXml(ipa)}</text>`
        );
      }

      wx += wordWidth + wordGap;
    });
  });

  return `
    <g filter="url(#bubbleShadow)">
      <path d="${tailPath}" fill="rgba(255,255,255,0.97)" stroke="rgba(255,255,255,0.75)" stroke-width="1.5"/>
      <rect x="${bounds.x}" y="${bounds.y}" width="${bounds.w}" height="${bounds.h}" rx="${radius}" ry="${radius}" fill="rgba(255,255,255,0.97)" stroke="rgba(255,255,255,0.75)" stroke-width="1.5"/>
    </g>
    <circle cx="${bounds.x + paddingX + 18}" cy="${bounds.y + bounds.h / 2}" r="18" fill="#1565C0"/>
    <text x="${bounds.x + paddingX + 18}" y="${bounds.y + bounds.h / 2 + 6}" font-family="sans-serif" font-size="17" font-weight="bold" fill="white" text-anchor="middle">${bubble.number}</text>
    ${wordParts.join("\n")}
  `;
}

function buildLogoSvg(): string {
  const logoPath = path.join(process.cwd(), "fluent_english_logo.png");
  const badgeX = 18;
  const badgeY = 16;
  const badgeW = 286;
  const badgeH = 104;

  if (fs.existsSync(logoPath)) {
    const logoB64 = fs.readFileSync(logoPath).toString("base64");
    return `
      <g filter="url(#logoBadgeShadow)">
        <rect x="${badgeX}" y="${badgeY}" width="${badgeW}" height="${badgeH}" rx="22" fill="rgba(255,255,255,0.94)" stroke="rgba(255,255,255,0.8)" stroke-width="1.5"/>
        <image href="data:image/png;base64,${logoB64}" x="${badgeX + 18}" y="${badgeY + 11}" width="250" height="82" preserveAspectRatio="xMidYMid meet"/>
      </g>
    `;
  }

  return `
    <g filter="url(#logoBadgeShadow)">
      <rect x="${badgeX}" y="${badgeY}" width="${badgeW}" height="${badgeH}" rx="22" fill="rgba(255,255,255,0.94)" stroke="rgba(255,255,255,0.8)" stroke-width="1.5"/>
      <text x="${badgeX + 26}" y="${badgeY + 64}" font-family="sans-serif" font-size="28" font-weight="bold" fill="#1565C0">Fluent English</text>
    </g>
  `;
}

function buildOverlaySvg(body: SlideRequest): string {
  const titleWords = body.main_title_words ?? body.main_title.split(" ");
  const titleIPA = body.main_title_ipa ?? titleWords.map(() => "");
  const bubblesSvg = (body.speech_bubbles ?? []).map((b) => buildBubbleSvg(b)).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <filter id="titleShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.48)"/>
    </filter>
    <filter id="bubbleShadow" x="-8%" y="-12%" width="124%" height="138%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="rgba(0,0,0,0.22)"/>
    </filter>
    <filter id="logoBadgeShadow" x="-8%" y="-14%" width="124%" height="138%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="rgba(0,0,0,0.20)"/>
    </filter>
    <linearGradient id="brightWash" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.16)"/>
      <stop offset="45%" stop-color="rgba(255,255,255,0.04)"/>
      <stop offset="100%" stop-color="rgba(255,235,160,0.12)"/>
    </linearGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#brightWash)"/>
  ${buildLogoSvg()}
  ${buildMainTitleSvg(titleWords, titleIPA)}
  ${bubblesSvg}
</svg>`;
}

router.post("/render-slide", async (req: Request, res: Response) => {
  const body = req.body as SlideRequest;

  if (!body.main_title || (!body.background_image_base64 && !body.background_image_url)) {
    res.status(400).json({
      error: "main_title and either background_image_base64 or background_image_url are required",
    });
    return;
  }

  try {
    let bgSharp: Sharp;

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
          brightness: 1.14,
          saturation: 1.24,
        });
    } catch {
      bgSharp = sharp({
        create: {
          width: WIDTH,
          height: HEIGHT,
          channels: 3,
          background: { r: 42, g: 96, b: 166 },
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
