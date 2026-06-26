import { Router, type IRouter, type Request, type Response } from "express";
import axios from "axios";
import sharp, { type Sharp } from "sharp";
import * as fs from "fs";
import * as path from "path";

const router: IRouter = Router();

const WIDTH = 1280;
const HEIGHT = 720;

type CornerPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";
type LogoPosition = CornerPosition | "auto";
type LogoVariant = "white" | "blue" | "black" | "auto";
type SpeakerSide = "left" | "right";

interface HeadBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SpeechBubble {
  number: number;
  text: string;
  words?: string[];
  ipa?: string[];
  highlight_words?: string[];
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
  main_title?: string;
  main_title_words?: string[];
  main_title_ipa?: string[];
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
  filePath: string;
  fallbackText: boolean;
  variant: Exclude<LogoVariant, "auto">;
}

function convertGDriveUrl(url: string): string {
  const match = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (match) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  }
  return url;
}

async function downloadImage(url: string): Promise<Buffer> {
  const response = await axios.get(convertGDriveUrl(url), {
    responseType: "arraybuffer",
    timeout: 15000,
    headers: { "User-Agent": "Mozilla/5.0" },
    maxRedirects: 5,
  });
  return Buffer.from(response.data);
}

function decodeBase64Image(base64: string): Buffer {
  const cleanBase64 = base64.replace(/^data:[^;]+;base64,/i, "");
  return Buffer.from(cleanBase64, "base64");
}

function escapeXml(value: string): string {
  return value
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

function toRect(box: HeadBox): Rect {
  return {
    x: box.x,
    y: box.y,
    w: box.width,
    h: box.height,
  };
}

function rectCenter(rect: Rect): Point {
  return {
    x: rect.x + rect.w / 2,
    y: rect.y + rect.h / 2,
  };
}

function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function rectOverlapArea(a: Rect, b: Rect): number {
  const overlapX = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const overlapY = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  return overlapX * overlapY;
}

function getSpeakerSide(head: Rect | undefined, bubble: SpeechBubble): SpeakerSide {
  if (head) {
    return rectCenter(head).x < WIDTH / 2 ? "left" : "right";
  }
  if (typeof bubble.tail_target_x === "number") {
    return bubble.tail_target_x < WIDTH / 2 ? "left" : "right";
  }
  return bubble.position === "top-right" || bubble.position === "bottom-right" ? "right" : "left";
}

function isSceneSlide(body: SlideRequest): boolean {
  if (typeof body.slide_number === "number") {
    return body.slide_number >= 2 && body.slide_number <= 9;
  }
  return body.slide_type === "scene" || body.layout_type === "scene";
}

function buildMainTitleSvg(words: string[], ipas: string[]): string {
  const fontSize = 54;
  const ipaFontSize = 18;
  const wordSpacing = 18;
  const topY = 48;
  const approxCharWidth = fontSize * 0.55;
  const wordWidths = words.map((word) => word.length * approxCharWidth + 8);
  const totalWidth = wordWidths.reduce((sum, width) => sum + width, 0) + wordSpacing * Math.max(0, words.length - 1);
  let x = (WIDTH - totalWidth) / 2;

  return words
    .map((word, index) => {
      const wordWidth = wordWidths[index];
      const cx = x + wordWidth / 2;
      const ipa = ipas[index] ?? "";
      x += wordWidth + wordSpacing;

      return `
        <text x="${cx}" y="${topY + fontSize}" font-family="Georgia, serif" font-size="${fontSize}" font-weight="bold" text-anchor="middle" stroke="white" stroke-width="5" stroke-linejoin="round" paint-order="stroke" filter="url(#titleShadow)" fill="#1565C0">${escapeXml(word)}</text>
        ${
          ipa
            ? `<text x="${cx}" y="${topY + fontSize + 26}" font-family="Georgia, serif" font-size="${ipaFontSize}" text-anchor="middle" stroke="rgba(0,0,0,0.45)" stroke-width="3" paint-order="stroke" fill="white">${escapeXml(ipa)}</text>`
            : ""
        }
      `;
    })
    .join("\n");
}

function getHeadTopTailTarget(head: Rect): Point {
  return {
    x: head.x + head.w / 2,
    y: Math.max(0, head.y - 18),
  };
}

function getDefaultTailTarget(bounds: Rect, position: CornerPosition): Point {
  switch (position) {
    case "top-right":
      return { x: bounds.x + bounds.w - 54, y: bounds.y + bounds.h + 54 };
    case "bottom-left":
      return { x: bounds.x + 54, y: bounds.y - 54 };
    case "bottom-right":
      return { x: bounds.x + bounds.w - 54, y: bounds.y - 54 };
    case "top-left":
    default:
      return { x: bounds.x + 54, y: bounds.y + bounds.h + 54 };
  }
}

function nudgeRectAwayFromHead(rect: Rect, head: Rect, target: Point): Rect {
  if (!rectsOverlap(rect, head)) return rect;

  const gap = 20;
  const candidates: Rect[] = [
    { ...rect, y: head.y - rect.h - gap },
    { ...rect, x: head.x - rect.w - gap },
    { ...rect, x: head.x + head.w + gap },
  ].map((candidate) => ({
    ...candidate,
    x: clamp(candidate.x, 34, WIDTH - candidate.w - 34),
    y: clamp(candidate.y, 22, HEIGHT - candidate.h - 34),
  }));

  const targetCenterDistance = (candidate: Rect): number => {
    const center = rectCenter(candidate);
    return Math.abs(center.x - target.x) + Math.abs(center.y - target.y);
  };

  const safeCandidates = candidates
    .filter((candidate) => !rectsOverlap(candidate, head))
    .sort((a, b) => targetCenterDistance(a) - targetCenterDistance(b));

  return safeCandidates[0] ?? rect;
}

function resolveBubbleBounds(bubble: SpeechBubble, bubbleWidth: number, bubbleHeight: number): Rect {
  const margin = 36;
  const position = bubble.position ?? (bubble.number === 2 ? "top-right" : "top-left");
  const head = bubble.avoid_head_box ? toRect(bubble.avoid_head_box) : undefined;
  const side = getSpeakerSide(head, bubble);

  let x: number;
  let y: number;

  if (typeof bubble.x === "number" && typeof bubble.y === "number") {
    x = bubble.x;
    y = bubble.y;
  } else if (position === "top-right") {
    x = WIDTH - bubbleWidth - margin;
    y = 136;
  } else if (position === "bottom-left") {
    x = margin;
    y = HEIGHT - bubbleHeight - margin;
  } else if (position === "bottom-right") {
    x = WIDTH - bubbleWidth - margin;
    y = HEIGHT - bubbleHeight - margin;
  } else {
    x = margin;
    y = 136;
  }

  let bounds: Rect = {
    x: clamp(x, margin, WIDTH - bubbleWidth - margin),
    y: clamp(y, 22, HEIGHT - bubbleHeight - margin),
    w: bubbleWidth,
    h: bubbleHeight,
  };

  if (head) {
    bounds.y = clamp(Math.min(bounds.y, head.y - bubbleHeight - 12), 22, HEIGHT - bubbleHeight - margin);
    if (side === "left") {
      bounds.x = clamp(bounds.x, margin, Math.max(margin, WIDTH / 2 - bubbleWidth - 20));
    } else {
      bounds.x = clamp(bounds.x, Math.min(WIDTH - bubbleWidth - margin, WIDTH / 2 + 20), WIDTH - bubbleWidth - margin);
    }
    bounds = nudgeRectAwayFromHead(bounds, head, getHeadTopTailTarget(head));
    bounds.y = clamp(Math.min(bounds.y, head.y - bubbleHeight - 12), 22, HEIGHT - bubbleHeight - margin);
  }

  return {
    ...bounds,
    x: clamp(bounds.x, margin, WIDTH - bounds.w - margin),
    y: clamp(bounds.y, 22, HEIGHT - bounds.h - margin),
  };
}

function keepTailOutsideHead(target: Point, bounds: Rect, head: Rect | undefined): Point {
  if (!head) return target;

  const safeTarget = getHeadTopTailTarget(head);
  const anchorX = rectCenter(bounds).x;
  const crossesFace =
    Math.min(anchorX, safeTarget.x) < head.x + head.w &&
    Math.max(anchorX, safeTarget.x) > head.x &&
    bounds.y + bounds.h < head.y + head.h &&
    safeTarget.y < head.y + head.h;

  if (!crossesFace) return safeTarget;

  if (anchorX < head.x + head.w / 2) {
    return { x: head.x + head.w * 0.18, y: Math.max(0, head.y - 14) };
  }
  return { x: head.x + head.w * 0.82, y: Math.max(0, head.y - 14) };
}

function buildDynamicTailPath(bounds: Rect, target: Point, side: SpeakerSide | undefined): string {
  const tailHalfWidth = 9;
  const curveLift = 12;

  if (side === "left") {
    const anchorX = bounds.x + bounds.w - 44;
    const anchorY = bounds.y + bounds.h - 2;
    const controlX = (anchorX + target.x) / 2 + 8;
    const controlY = (anchorY + target.y) / 2 - curveLift;
    return `M ${anchorX - tailHalfWidth} ${anchorY} Q ${controlX - 8} ${controlY} ${target.x} ${target.y} Q ${controlX + 10} ${controlY + 4} ${anchorX + tailHalfWidth} ${anchorY} Z`;
  }

  if (side === "right") {
    const anchorX = bounds.x + 44;
    const anchorY = bounds.y + bounds.h - 2;
    const controlX = (anchorX + target.x) / 2 - 8;
    const controlY = (anchorY + target.y) / 2 - curveLift;
    return `M ${anchorX - tailHalfWidth} ${anchorY} Q ${controlX - 10} ${controlY + 4} ${target.x} ${target.y} Q ${controlX + 8} ${controlY} ${anchorX + tailHalfWidth} ${anchorY} Z`;
  }

  const center = rectCenter(bounds);
  const dx = target.x - center.x;
  const dy = target.y - center.y;
  const inset = 34;

  if (Math.abs(dx) > Math.abs(dy)) {
    const anchorY = clamp(target.y, bounds.y + inset, bounds.y + bounds.h - inset);
    if (dx < 0) {
      return `M ${bounds.x} ${anchorY - tailHalfWidth} L ${bounds.x} ${anchorY + tailHalfWidth} L ${target.x} ${target.y} Z`;
    }
    return `M ${bounds.x + bounds.w} ${anchorY - tailHalfWidth} L ${bounds.x + bounds.w} ${anchorY + tailHalfWidth} L ${target.x} ${target.y} Z`;
  }

  const anchorX = clamp(target.x, bounds.x + inset, bounds.x + bounds.w - inset);
  if (dy < 0) {
    return `M ${anchorX - tailHalfWidth} ${bounds.y} L ${anchorX + tailHalfWidth} ${bounds.y} L ${target.x} ${target.y} Z`;
  }
  return `M ${anchorX - tailHalfWidth} ${bounds.y + bounds.h} L ${anchorX + tailHalfWidth} ${bounds.y + bounds.h} L ${target.x} ${target.y} Z`;
}

function buildOrganicBubblePath(bounds: Rect): string {
  const r = Math.min(48, Math.max(32, bounds.h * 0.46));
  const x = bounds.x;
  const y = bounds.y;
  const w = bounds.w;
  const h = bounds.h;
  const topWave = Math.min(10, h * 0.08);
  const sideWave = Math.min(8, w * 0.02);

  return [
    `M ${x + r} ${y + 2}`,
    `C ${x + w * 0.34} ${y - topWave} ${x + w * 0.66} ${y - topWave} ${x + w - r} ${y + 2}`,
    `C ${x + w - sideWave} ${y + 2} ${x + w - 2} ${y + r * 0.42} ${x + w - 3} ${y + r}`,
    `L ${x + w - 3} ${y + h - r}`,
    `C ${x + w - 2} ${y + h - r * 0.36} ${x + w - sideWave} ${y + h - 2} ${x + w - r} ${y + h - 2}`,
    `C ${x + w * 0.66} ${y + h + topWave * 0.72} ${x + w * 0.34} ${y + h + topWave * 0.72} ${x + r} ${y + h - 2}`,
    `C ${x + sideWave} ${y + h - 2} ${x + 2} ${y + h - r * 0.38} ${x + 3} ${y + h - r}`,
    `L ${x + 3} ${y + r}`,
    `C ${x + 2} ${y + r * 0.42} ${x + sideWave} ${y + 2} ${x + r} ${y + 2}`,
    "Z",
  ].join(" ");
}

function buildBubbleSvg(bubble: SpeechBubble): { svg: string; bounds: Rect } {
  const words = bubble.words?.length ? bubble.words : bubble.text.split(/\s+/).filter(Boolean);
  const ipas = bubble.ipa ?? [];
  const highlights = bubble.highlight_words ?? [];
  const highlightSet = new Set(highlights.map((word) => word.toLowerCase()));
  const position = bubble.position ?? (bubble.number === 2 ? "top-right" : "top-left");

  const paddingX = 22;
  const paddingY = 17;
  const badgeColumnWidth = 47;
  const wordFontSize = 28;
  const ipaFontSize = 13;
  const wordGap = 10;
  const rowGap = 5;
  const rowHeight = wordFontSize + 5 + ipaFontSize + rowGap;
  const minBubbleWidth = 238;
  const maxBubbleWidth = 492;
  const minBubbleHeight = typeof bubble.min_height === "number" ? Math.max(76, bubble.min_height) : 80;
  const requestedWidth = typeof bubble.width === "number" ? clamp(bubble.width, minBubbleWidth, maxBubbleWidth) : undefined;
  const wordWidths = words.map((word) => Math.max(28, word.length * wordFontSize * 0.57 + 6));

  const wrapWords = (textMaxWidth: number): number[][] => {
    const lines: number[][] = [];
    let currentLine: number[] = [];
    let currentWidth = 0;

    words.forEach((_word, index) => {
      const neededWidth = wordWidths[index] + (currentLine.length > 0 ? wordGap : 0);
      if (currentLine.length > 0 && currentWidth + neededWidth > textMaxWidth) {
        lines.push(currentLine);
        currentLine = [index];
        currentWidth = wordWidths[index];
      } else {
        currentLine.push(index);
        currentWidth += neededWidth;
      }
    });

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    return lines.length > 0 ? lines : [[]];
  };

  const measuredMaxTextWidth = maxBubbleWidth - paddingX * 2 - badgeColumnWidth;
  const measuredLines = wrapWords(measuredMaxTextWidth);
  const measuredLineWidths = measuredLines.map((line) =>
    line.reduce((sum, index, lineIndex) => sum + wordWidths[index] + (lineIndex > 0 ? wordGap : 0), 0)
  );
  const widestLine = Math.max(...measuredLineWidths, 0);
  const bubbleWidth =
    requestedWidth ??
    clamp(Math.ceil(widestLine + paddingX * 2 + badgeColumnWidth), minBubbleWidth, maxBubbleWidth);
  const textMaxWidth = bubbleWidth - paddingX * 2 - badgeColumnWidth;
  const lines = wrapWords(textMaxWidth);
  const contentHeight = lines.length * rowHeight - rowGap;
  const bubbleHeight = Math.max(minBubbleHeight, Math.ceil(contentHeight + paddingY * 2));
  const bounds = resolveBubbleBounds(bubble, bubbleWidth, bubbleHeight);
  const head = bubble.avoid_head_box ? toRect(bubble.avoid_head_box) : undefined;
  const side = getSpeakerSide(head, bubble);
  const rawTarget =
    head
      ? getHeadTopTailTarget(head)
      : typeof bubble.tail_target_x === "number" && typeof bubble.tail_target_y === "number"
        ? { x: clamp(bubble.tail_target_x, 0, WIDTH), y: clamp(bubble.tail_target_y, 0, HEIGHT) }
        : getDefaultTailTarget(bounds, position);
  const tailTarget = keepTailOutsideHead(rawTarget, bounds, head);
  const tailPath = buildDynamicTailPath(bounds, tailTarget, head ? side : undefined);
  const bubblePath = buildOrganicBubblePath(bounds);
  const textStartX = bounds.x + paddingX + badgeColumnWidth;
  const textStartY = bounds.y + (bounds.h - contentHeight) / 2 + wordFontSize;

  const wordParts: string[] = [];

  lines.forEach((line, lineIndex) => {
    const lineWidth = line.reduce((sum, index, wordIndex) => sum + wordWidths[index] + (wordIndex > 0 ? wordGap : 0), 0);
    let x = textStartX + Math.max(0, (textMaxWidth - lineWidth) / 2);
    const baselineY = textStartY + lineIndex * rowHeight;

    line.forEach((wordIndex) => {
      const word = words[wordIndex];
      const ipa = ipas[wordIndex] ?? "";
      const wordWidth = wordWidths[wordIndex];
      const highlighted = highlightSet.has(word.toLowerCase());

      if (highlighted) {
        wordParts.push(
          `<rect x="${x - 5}" y="${baselineY - wordFontSize - 3}" width="${wordWidth + 10}" height="${wordFontSize + 8}" rx="10" fill="rgba(255,225,34,0.92)" stroke="rgba(20,20,20,0.18)" stroke-width="1"/>`
        );
      }

      wordParts.push(
        `<text x="${x}" y="${baselineY}" font-family="Trebuchet MS, Arial Rounded MT Bold, Arial, sans-serif" font-size="${wordFontSize}" font-weight="${highlighted ? "800" : "700"}" fill="#0c0c0c" stroke="rgba(255,255,255,0.38)" stroke-width="0.35" paint-order="stroke">${escapeXml(word)}</text>`
      );

      if (ipa) {
        wordParts.push(
          `<text x="${x}" y="${baselineY + ipaFontSize + 5}" font-family="Arial, Helvetica, sans-serif" font-size="${ipaFontSize}" font-weight="600" fill="#38414d">${escapeXml(ipa)}</text>`
        );
      }

      x += wordWidth + wordGap;
    });
  });

  return {
    bounds,
    svg: `
      <g filter="url(#bubbleShadow)">
        <path d="${tailPath}" fill="#ffffff" stroke="#0b0b0b" stroke-width="3.1" stroke-linejoin="round"/>
        <path d="${bubblePath}" fill="#ffffff" stroke="#0b0b0b" stroke-width="3.25" stroke-linejoin="round"/>
        <path d="${bubblePath}" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1.4" transform="translate(0 1) scale(0.988 0.982)" transform-origin="${bounds.x + bounds.w / 2} ${bounds.y + bounds.h / 2}"/>
      </g>
      <circle cx="${bounds.x + paddingX + 16}" cy="${bounds.y + bounds.h / 2}" r="17" fill="url(#badgeBlue)" stroke="#082f73" stroke-width="2.2"/>
      <circle cx="${bounds.x + paddingX + 10}" cy="${bounds.y + bounds.h / 2 - 7}" r="4.8" fill="rgba(255,255,255,0.5)"/>
      <text x="${bounds.x + paddingX + 16}" y="${bounds.y + bounds.h / 2 + 6}" font-family="Trebuchet MS, Arial, sans-serif" font-size="17" font-weight="800" fill="#ffffff" text-anchor="middle">${bubble.number}</text>
      ${wordParts.join("\n")}
    `,
  };
}

async function sampleAverageLuminance(baseImage: Sharp, rect: Rect): Promise<number | undefined> {
  try {
    const stats = await baseImage
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

function getLogoRect(position: CornerPosition): Rect {
  const margin = 18;
  const w = 340;
  const h = 125;

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
  bubbleBounds: Rect[],
  sceneSlide: boolean
): CornerPosition {
  if (requested && requested !== "auto") return requested;

  const titleArea: Rect = { x: 230, y: 0, w: 820, h: 140 };
  const topArea: Rect = { x: 0, y: 0, w: WIDTH, h: 310 };
  const candidates: CornerPosition[] = ["bottom-left", "bottom-right", "top-left", "top-right"];

  const scored = candidates
    .map((position) => {
      const logoRect = getLogoRect(position);
      const logoCenter = rectCenter(logoRect);
      const bubblePenalty = bubbleBounds.reduce((total, bubble) => {
        const bubbleCenter = rectCenter(bubble);
        const distance = Math.abs(logoCenter.x - bubbleCenter.x) + Math.abs(logoCenter.y - bubbleCenter.y);
        return total + rectOverlapArea(logoRect, bubble) * 18 + Math.max(0, 430 - distance) * 2;
      }, 0);
      const titlePenalty = rectOverlapArea(logoRect, titleArea) * 20;
      const topPenalty = position.startsWith("top") ? rectOverlapArea(logoRect, topArea) * 2 + 650 : 0;
      const sceneTopPenalty = sceneSlide && position.startsWith("top") ? 1750 : 0;
      const bottomBonus = position.startsWith("bottom") ? 300 : 0;

      return {
        position,
        score: bottomBonus - bubblePenalty - titlePenalty - topPenalty - sceneTopPenalty,
      };
    })
    .sort((a, b) => b.score - a.score);

  return scored[0]?.position ?? "bottom-left";
}

async function resolveLogoVariant(
  requested: LogoVariant | undefined,
  baseImage: Sharp,
  logoRect: Rect
): Promise<Exclude<LogoVariant, "auto">> {
  if (requested && requested !== "auto") return requested;

  const luminance = await sampleAverageLuminance(baseImage, logoRect);
  if (typeof luminance !== "number") return "blue";
  if (luminance < 96) return "white";
  if (luminance > 190) return "black";
  return "blue";
}

function selectLogo(variant: Exclude<LogoVariant, "auto">): LogoSelection {
  const root = process.cwd();
  const preferred = path.join(root, `fluent_english_logo_${variant}.png`);
  if (fs.existsSync(preferred)) {
    return { filePath: preferred, fallbackText: false, variant };
  }

  const fallback = path.join(root, "fluent_english_logo.png");
  if (fs.existsSync(fallback)) {
    return { filePath: fallback, fallbackText: false, variant };
  }

  return { filePath: fallback, fallbackText: true, variant };
}

async function buildLogoSvg(
  requestedPosition: LogoPosition | undefined,
  requestedVariant: LogoVariant | undefined,
  bubbleBounds: Rect[],
  sceneSlide: boolean,
  baseImage: Sharp
): Promise<string> {
  const position = resolveLogoPosition(requestedPosition, bubbleBounds, sceneSlide);
  const rect = getLogoRect(position);
  const variant = await resolveLogoVariant(requestedVariant, baseImage, rect);
  const logo = selectLogo(variant);

  if (!logo.fallbackText) {
    const logoBase64 = fs.readFileSync(logo.filePath).toString("base64");
    return `
      <g filter="url(#logoShadow)">
        <image href="data:image/png;base64,${logoBase64}" x="${rect.x}" y="${rect.y}" width="${rect.w}" height="${rect.h}" preserveAspectRatio="xMidYMid meet"/>
      </g>
    `;
  }

  const fill = variant === "white" ? "#ffffff" : variant === "black" ? "#111111" : "#1565c0";
  const stroke = variant === "white" ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.7)";
  return `
    <g filter="url(#logoShadow)">
      <text x="${rect.x}" y="${rect.y + 66}" font-family="Trebuchet MS, Arial, sans-serif" font-size="36" font-weight="800" fill="${fill}" stroke="${stroke}" stroke-width="2.4" paint-order="stroke">Fluent English</text>
    </g>
  `;
}

async function buildOverlaySvg(body: SlideRequest, baseImage: Sharp): Promise<string> {
  const sceneSlide = isSceneSlide(body);
  const title = body.main_title ?? "";
  const titleWords = body.main_title_words?.length ? body.main_title_words : title.split(/\s+/).filter(Boolean);
  const titleIpa = body.main_title_ipa ?? [];
  const sourceBubbles = body.speech_bubbles ?? [];
  const bubblesToRender = sceneSlide ? sourceBubbles.slice(0, 2) : sourceBubbles;
  const bubbles = bubblesToRender.map((bubble, index) =>
    buildBubbleSvg({
      ...bubble,
      number: bubble.number ?? index + 1,
      position: bubble.position ?? (index === 1 ? "top-right" : "top-left"),
    })
  );
  const logoSvg = await buildLogoSvg(
    body.logo_position,
    body.logo_variant,
    bubbles.map((bubble) => bubble.bounds),
    sceneSlide,
    baseImage
  );
  const shouldRenderTitle = body.slide_number === 1 && titleWords.length > 0;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <filter id="titleShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.45)"/>
    </filter>
    <filter id="bubbleShadow" x="-10%" y="-14%" width="128%" height="142%">
      <feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="rgba(0,0,0,0.23)"/>
    </filter>
    <filter id="logoShadow" x="-8%" y="-12%" width="124%" height="136%">
      <feDropShadow dx="0" dy="7" stdDeviation="8" flood-color="rgba(0,0,0,0.22)"/>
    </filter>
    <linearGradient id="badgeBlue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2b8cff"/>
      <stop offset="54%" stop-color="#1565c0"/>
      <stop offset="100%" stop-color="#0b3f91"/>
    </linearGradient>
    <linearGradient id="brightWash" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.14)"/>
      <stop offset="48%" stop-color="rgba(255,255,255,0.03)"/>
      <stop offset="100%" stop-color="rgba(255,235,155,0.10)"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#brightWash)"/>
  ${logoSvg}
  ${shouldRenderTitle ? buildMainTitleSvg(titleWords, titleIpa) : ""}
  ${bubbles.map((bubble) => bubble.svg).join("\n")}
</svg>`;
}

router.post("/render-slide", async (req: Request, res: Response) => {
  const body = req.body as SlideRequest;

  if (!body.background_image_base64 && !body.background_image_url) {
    res.status(400).json({
      error: "Either background_image_base64 or background_image_url is required",
    });
    return;
  }

  try {
    let baseImage: Sharp;

    try {
      const imageBuffer = body.background_image_base64
        ? decodeBase64Image(body.background_image_base64)
        : await downloadImage(body.background_image_url as string);

      baseImage = sharp(imageBuffer)
        .resize(WIDTH, HEIGHT, {
          fit: "cover",
          position: "center",
        })
        .modulate({
          brightness: 1.14,
          saturation: 1.24,
        })
        .sharpen();
    } catch {
      baseImage = sharp({
        create: {
          width: WIDTH,
          height: HEIGHT,
          channels: 3,
          background: { r: 42, g: 96, b: 166 },
        },
      }).sharpen();
    }

    const overlaySvg = await buildOverlaySvg(body, baseImage);
    const pngBuffer = await baseImage
      .composite([{ input: Buffer.from(overlaySvg, "utf8"), top: 0, left: 0 }])
      .png()
      .toBuffer();

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Length", pngBuffer.length);
    res.send(pngBuffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("render-slide failed:", message);
    res.status(500).json({ error: "Failed to render slide", detail: message });
  }
});

export default router;
