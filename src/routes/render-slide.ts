import { Router, type IRouter, type Request, type Response } from "express";
import sharp, { type Sharp } from "sharp";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";

const router: IRouter = Router();

const WIDTH = 1280;
const HEIGHT = 720;

type CornerPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";
type LogoPosition = CornerPosition | "auto";
type LogoVariant = "blue" | "black" | "white" | "auto";

interface HeadBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

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
  avoid_head_box?: HeadBox;
  position?: CornerPosition;
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
  logo_position?: LogoPosition;
  logo_variant?: LogoVariant;
  output_format?: string;
  aspect_ratio?: string;
  speech_bubbles?: SpeechBubble[];
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Point {
  x: number;
  y: number;
}

interface LogoSelection {
  path: string;
  variant: Exclude<LogoVariant, "auto">;
  fallbackText: boolean;
}

type SpeakerSide = "left" | "right";

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
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function rectOverlapArea(a: Rect, b: Rect): number {
  const xOverlap = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const yOverlap = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  return xOverlap * yOverlap;
}

function toRect(box: HeadBox): Rect {
  return { x: box.x, y: box.y, w: box.width, h: box.height };
}

function rectCenter(rect: Rect): Point {
  return { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };
}

function getSpeakerSide(head: Rect | undefined, bubble: SpeechBubble): SpeakerSide {
  if (head) return rectCenter(head).x < WIDTH / 2 ? "left" : "right";
  if (typeof bubble.tail_target_x === "number") {
    return bubble.tail_target_x < WIDTH / 2 ? "left" : "right";
  }
  return bubble.position === "top-right" || bubble.position === "bottom-right" ? "right" : "left";
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

function nudgeRectAwayFromHead(rect: Rect, head: Rect, tailTarget?: Point): Rect {
  if (!rectsOverlap(rect, head)) return rect;

  const margin = 18;
  const candidates: Rect[] = [
    { ...rect, x: head.x - rect.w - margin },
    { ...rect, x: head.x + head.w + margin },
    { ...rect, y: head.y - rect.h - margin },
    { ...rect, y: head.y + head.h + margin },
  ].map((candidate) => ({
    ...candidate,
    x: clamp(candidate.x, 28, WIDTH - candidate.w - 28),
    y: clamp(candidate.y, 24, HEIGHT - candidate.h - 28),
  }));

  const headCenter = rectCenter(head);
  const target = tailTarget ?? headCenter;
  const scored = candidates
    .filter((candidate) => !rectsOverlap(candidate, head))
    .map((candidate) => {
      const center = rectCenter(candidate);
      const distanceFromHead =
        Math.abs(center.x - headCenter.x) + Math.abs(center.y - headCenter.y);
      const tailDistance =
        Math.abs(center.x - target.x) * 0.35 + Math.abs(center.y - target.y) * 0.35;
      const movement = Math.abs(candidate.x - rect.x) + Math.abs(candidate.y - rect.y);
      return { candidate, score: distanceFromHead - tailDistance - movement * 0.2 };
    })
    .sort((a, b) => b.score - a.score);

  return scored[0]?.candidate ?? rect;
}

function resolveBubbleBounds(
  bubble: SpeechBubble,
  bubbleWidth: number,
  bubbleHeight: number
): Rect {
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

  const head = bubble.avoid_head_box ? toRect(bubble.avoid_head_box) : undefined;
  const side = getSpeakerSide(head, bubble);
  let bounds: Rect = {
    x: clamp(x, margin, WIDTH - bubbleWidth - margin),
    y: clamp(y, head ? 24 : 128, HEIGHT - bubbleHeight - margin),
    w: bubbleWidth,
    h: bubbleHeight,
  };

  if (head) {
    const maxYAboveHead = head.y - bubbleHeight - 12;
    bounds.y = clamp(Math.min(bounds.y, maxYAboveHead), 24, HEIGHT - bubbleHeight - margin);

    if (side === "left") {
      bounds.x = clamp(bounds.x, margin, Math.max(margin, WIDTH / 2 - bubbleWidth - 22));
    } else {
      bounds.x = clamp(bounds.x, Math.min(WIDTH - bubbleWidth - margin, WIDTH / 2 + 22), WIDTH - bubbleWidth - margin);
    }

    const tailTarget =
      typeof bubble.tail_target_x === "number" && typeof bubble.tail_target_y === "number"
        ? { x: bubble.tail_target_x, y: bubble.tail_target_y }
        : undefined;
    bounds = nudgeRectAwayFromHead(bounds, head, tailTarget);
  }

  return {
    ...bounds,
    x: clamp(bounds.x, margin, WIDTH - bounds.w - margin),
    y: clamp(bounds.y, head ? 24 : 128, HEIGHT - bounds.h - margin),
  };
}

function getHeadTopTailTarget(head: Rect): Point {
  return {
    x: head.x + head.w / 2,
    y: Math.max(0, head.y - 18),
  };
}

function getDefaultTailTarget(bounds: Rect, position?: CornerPosition): Point {
  switch (position) {
    case "top-right":
      return { x: bounds.x + bounds.w - 58, y: bounds.y + bounds.h + 58 };
    case "bottom-left":
      return { x: bounds.x + 58, y: bounds.y - 58 };
    case "bottom-right":
      return { x: bounds.x + bounds.w - 58, y: bounds.y - 58 };
    case "top-left":
    default:
      return { x: bounds.x + 58, y: bounds.y + bounds.h + 58 };
  }
}

function keepTailOutsideHead(target: Point, bounds: Rect, head?: Rect): Point {
  if (!head) return target;

  const safeTarget = getHeadTopTailTarget(head);
  const center = rectCenter(bounds);
  const crossesHead =
    Math.min(center.x, safeTarget.x) < head.x + head.w &&
    Math.max(center.x, safeTarget.x) > head.x &&
    Math.min(center.y, safeTarget.y) < head.y + head.h &&
    Math.max(center.y, safeTarget.y) > head.y + head.h * 0.35;

  if (!crossesHead) return safeTarget;

  if (center.x < head.x) {
    return { x: head.x + head.w * 0.2, y: head.y + Math.max(8, head.h * 0.2) };
  }
  if (center.x > head.x + head.w) {
    return { x: head.x + head.w * 0.8, y: head.y + Math.max(8, head.h * 0.2) };
  }

  return { x: safeTarget.x, y: head.y };
}

function buildDynamicTailPath(bounds: Rect, target: Point, side?: SpeakerSide): string {
  const tailHalfWidth = 7;
  if (side) {
    const anchorX = side === "left" ? bounds.x + bounds.w - 38 : bounds.x + 38;
    const anchorY = bounds.y + bounds.h;
    return `M ${anchorX - tailHalfWidth} ${anchorY} L ${anchorX + tailHalfWidth} ${anchorY} L ${target.x} ${target.y} Z`;
  }

  const cornerInset = 36;
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

function buildBubbleSvg(bubble: SpeechBubble): { svg: string; bounds: Rect } {
  const words = bubble.words?.length ? bubble.words : bubble.text.split(/\s+/).filter(Boolean);
  const ipas = bubble.ipa ?? [];
  const highlights = bubble.highlight_words ?? [];
  const position = bubble.position ?? "top-left";

  const paddingX = 22;
  const paddingY = 18;
  const numberColumnWidth = 48;
  const radius = 26;
  const wordFontSize = 26;
  const ipaFontSize = 13;
  const wordGap = 10;
  const rowGap = 7;
  const rowHeight = wordFontSize + 5 + ipaFontSize + rowGap;
  const minBubbleWidth = 250;
  const maxBubbleWidth = 505;
  const requestedWidth =
    typeof bubble.width === "number" ? clamp(bubble.width, minBubbleWidth, maxBubbleWidth) : undefined;
  const minBubbleHeight = typeof bubble.min_height === "number" ? Math.max(76, bubble.min_height) : 82;

  const approxCharWidth = wordFontSize * 0.57;
  const wordWidths = words.map((w) => w.length * approxCharWidth + 5);

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
  const head = bubble.avoid_head_box ? toRect(bubble.avoid_head_box) : undefined;
  const side = getSpeakerSide(head, bubble);
  const rawTailTarget =
    head
      ? getHeadTopTailTarget(head)
      : typeof bubble.tail_target_x === "number" && typeof bubble.tail_target_y === "number"
      ? { x: clamp(bubble.tail_target_x, 0, WIDTH), y: clamp(bubble.tail_target_y, 0, HEIGHT) }
      : getDefaultTailTarget(bounds, position);
  const tailTarget = keepTailOutsideHead(rawTailTarget, bounds, head);
  const tailPath = buildDynamicTailPath(bounds, tailTarget, head ? side : undefined);
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
          `<rect x="${wx - 5}" y="${baseY - wordFontSize - 3}" width="${wordWidth + 10}" height="${wordFontSize + 8}" fill="rgba(255,224,36,0.9)" stroke="rgba(30,30,30,0.12)" stroke-width="1" rx="7"/>`
        );
      }

      wordParts.push(
        `<text x="${wx}" y="${baseY}" font-family="Trebuchet MS, Arial Rounded MT Bold, Arial, sans-serif" font-size="${wordFontSize}" font-weight="${isHighlight ? "800" : "700"}" fill="#101010" text-anchor="start">${escapeXml(word)}</text>`
      );

      if (ipa) {
        wordParts.push(
          `<text x="${wx}" y="${baseY + 5 + ipaFontSize}" font-family="Georgia, serif" font-size="${ipaFontSize}" fill="#3f4652" text-anchor="start">${escapeXml(ipa)}</text>`
        );
      }

      wx += wordWidth + wordGap;
    });
  });

  return {
    bounds,
    svg: `
      <g filter="url(#bubbleShadow)">
        <path d="${tailPath}" fill="#ffffff" stroke="#111111" stroke-width="2.6" stroke-linejoin="round"/>
        <rect x="${bounds.x}" y="${bounds.y}" width="${bounds.w}" height="${bounds.h}" rx="${radius}" ry="${radius}" fill="#ffffff" stroke="#111111" stroke-width="2.8"/>
        <rect x="${bounds.x + 5}" y="${bounds.y + 5}" width="${bounds.w - 10}" height="${bounds.h - 10}" rx="${radius - 6}" ry="${radius - 6}" fill="none" stroke="rgba(255,255,255,0.82)" stroke-width="1.4"/>
      </g>
      <circle cx="${bounds.x + paddingX + 16}" cy="${bounds.y + bounds.h / 2}" r="18" fill="url(#badgeBlue)" stroke="#0B3F91" stroke-width="2"/>
      <circle cx="${bounds.x + paddingX + 10}" cy="${bounds.y + bounds.h / 2 - 7}" r="5" fill="rgba(255,255,255,0.48)"/>
      <text x="${bounds.x + paddingX + 16}" y="${bounds.y + bounds.h / 2 + 6}" font-family="Trebuchet MS, Arial, sans-serif" font-size="17" font-weight="800" fill="white" text-anchor="middle">${bubble.number}</text>
      ${wordParts.join("\n")}
    `,
  };
}

async function sampleAverageLuminance(bgSharp: Sharp, rect: Rect): Promise<number | undefined> {
  try {
    const stats = await bgSharp
      .clone()
      .extract({
        left: Math.round(rect.x),
        top: Math.round(rect.y),
        width: Math.round(rect.w),
        height: Math.round(rect.h),
      })
      .stats();
    const [r, g, b] = stats.channels;
    return 0.2126 * r.mean + 0.7152 * g.mean + 0.0722 * b.mean;
  } catch {
    return undefined;
  }
}

async function resolveLogoVariant(
  requested: LogoVariant | undefined,
  bgSharp: Sharp,
  logoRect: Rect
): Promise<Exclude<LogoVariant, "auto">> {
  if (requested && requested !== "auto") return requested;
  const luminance = await sampleAverageLuminance(bgSharp, logoRect);
  if (typeof luminance !== "number") return "blue";
  if (luminance < 95) return "white";
  if (luminance > 188) return "black";
  return "blue";
}

function selectLogo(variant: Exclude<LogoVariant, "auto">): LogoSelection {
  const root = process.cwd();
  const preferredPath = path.join(root, `fluent_english_logo_${variant}.png`);

  if (fs.existsSync(preferredPath)) {
    return { path: preferredPath, variant, fallbackText: false };
  }

  const fallbackPath = path.join(root, "fluent_english_logo.png");
  if (fs.existsSync(fallbackPath)) {
    return { path: fallbackPath, variant, fallbackText: false };
  }

  return { path: fallbackPath, variant, fallbackText: true };
}

function getLogoRect(position: CornerPosition): Rect {
  const margin = 18;
  const w = 280;
  const h = 104;

  switch (position) {
    case "top-right":
      return { x: WIDTH - w - margin, y: margin, w, h };
    case "bottom-left":
      return { x: margin, y: HEIGHT - h - margin, w, h };
    case "bottom-right":
      return { x: WIDTH - w - margin, y: HEIGHT - h - margin, w, h };
    case "top-left":
    default:
      return { x: margin, y: margin, w, h };
  }
}

function resolveLogoPosition(
  requested: LogoPosition | undefined,
  bubbleBounds: Rect[]
): CornerPosition {
  if (requested && requested !== "auto") return requested;

  const titleSafeArea: Rect = { x: 250, y: 8, w: 780, h: 132 };
  const busyTopArea: Rect = { x: 0, y: 0, w: WIDTH, h: 300 };
  const topHasBubbleClutter = bubbleBounds.some((bubble) => bubble.y < 300);
  const candidates: CornerPosition[] = ["top-left", "top-right", "bottom-left", "bottom-right"];
  const scored = candidates
    .map((position) => {
      const logoRect = getLogoRect(position);
      const bubblePenalty = bubbleBounds.reduce((penalty, bubble) => {
        const overlap = rectOverlapArea(logoRect, bubble);
        const logoCenter = rectCenter(logoRect);
        const bubbleCenter = rectCenter(bubble);
        const distance =
          Math.abs(logoCenter.x - bubbleCenter.x) + Math.abs(logoCenter.y - bubbleCenter.y);
        const proximityPenalty = Math.max(0, 360 - distance) * 2;
        return penalty + overlap * 16 + proximityPenalty;
      }, 0);
      const titlePenalty = rectOverlapArea(logoRect, titleSafeArea) * 20;
      const busyTopPenalty = position.startsWith("top")
        ? 900 + rectOverlapArea(logoRect, busyTopArea) * 2
        : 0;
      const roleplayTopPenalty = topHasBubbleClutter && position.startsWith("top") ? 1600 : 0;
      const bottomPreference = position.startsWith("bottom") ? 260 : 0;

      return {
        position,
        score: bottomPreference - bubblePenalty - titlePenalty - busyTopPenalty - roleplayTopPenalty,
      };
    })
    .sort((a, b) => b.score - a.score);

  return scored[0]?.position ?? "bottom-left";
}

async function buildLogoSvg(
  position: CornerPosition,
  variant: LogoVariant | undefined,
  bgSharp: Sharp
): Promise<string> {
  const rect = getLogoRect(position);
  const resolvedVariant = await resolveLogoVariant(variant, bgSharp, rect);
  const logo = selectLogo(resolvedVariant);
  const textFill = logo.variant === "white" ? "white" : logo.variant === "black" ? "#111111" : "#1565C0";

  if (!logo.fallbackText) {
    const logoB64 = fs.readFileSync(logo.path).toString("base64");
    return `
      <g filter="url(#logoBadgeShadow)">
        <image href="data:image/png;base64,${logoB64}" x="${rect.x}" y="${rect.y}" width="${rect.w}" height="${rect.h}" preserveAspectRatio="xMidYMid meet"/>
      </g>
    `;
  }

  return `
    <g filter="url(#logoBadgeShadow)">
      <text x="${rect.x}" y="${rect.y + 50}" font-family="sans-serif" font-size="30" font-weight="bold" fill="${textFill}" stroke="${logo.variant === "white" ? "rgba(0,0,0,0.42)" : "rgba(255,255,255,0.55)"}" stroke-width="2" paint-order="stroke">Fluent English</text>
    </g>
  `;
}

async function buildOverlaySvg(body: SlideRequest, bgSharp: Sharp): Promise<string> {
  const titleWords = body.main_title_words ?? body.main_title.split(" ");
  const titleIPA = body.main_title_ipa ?? titleWords.map(() => "");
  const isSceneSlide =
    typeof body.slide_number === "number" && body.slide_number >= 2 && body.slide_number <= 9;
  const bubbles = (isSceneSlide ? (body.speech_bubbles ?? []).slice(0, 2) : body.speech_bubbles ?? []).map((b) =>
    buildBubbleSvg(b)
  );
  const logoPosition = resolveLogoPosition(body.logo_position, bubbles.map((b) => b.bounds));
  const logoSvg = await buildLogoSvg(logoPosition, body.logo_variant, bgSharp);
  const shouldRenderTitle =
    typeof body.slide_number !== "number" || body.slide_number === 1 || body.slide_number === 10;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <filter id="titleShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.48)"/>
    </filter>
    <filter id="bubbleShadow" x="-8%" y="-12%" width="124%" height="138%">
      <feDropShadow dx="0" dy="7" stdDeviation="7" flood-color="rgba(0,0,0,0.24)"/>
    </filter>
    <filter id="logoBadgeShadow" x="-8%" y="-14%" width="124%" height="138%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="rgba(0,0,0,0.20)"/>
    </filter>
    <linearGradient id="badgeBlue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2B8CFF"/>
      <stop offset="52%" stop-color="#1565C0"/>
      <stop offset="100%" stop-color="#0B3F91"/>
    </linearGradient>
    <linearGradient id="brightWash" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.16)"/>
      <stop offset="45%" stop-color="rgba(255,255,255,0.04)"/>
      <stop offset="100%" stop-color="rgba(255,235,160,0.12)"/>
    </linearGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#brightWash)"/>
  ${logoSvg}
  ${shouldRenderTitle ? buildMainTitleSvg(titleWords, titleIPA) : ""}
  ${bubbles.map((b) => b.svg).join("\n")}
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

    const overlaySvg = await buildOverlaySvg(body, bgSharp);
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
