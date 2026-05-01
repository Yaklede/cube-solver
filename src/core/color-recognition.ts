import type { ColorProfile, ColorSample, LabColor, RgbColor, StickerColor } from "@/core/models";

const SATURATED_HUE_WEIGHT: Record<StickerColor, number> = {
  white: 0,
  yellow: 0.95,
  red: 1.65,
  orange: 1.65,
  blue: 1.05,
  green: 1.05,
};

export const DEFAULT_COLOR_RGB: Record<StickerColor, RgbColor> = {
  white: { r: 245, g: 245, b: 242 },
  yellow: { r: 245, g: 205, b: 40 },
  red: { r: 204, g: 42, b: 43 },
  orange: { r: 235, g: 112, b: 34 },
  blue: { r: 38, g: 93, b: 171 },
  green: { r: 42, g: 150, b: 88 },
};

export function createDefaultColorProfile(): ColorProfile {
  return {
    id: "default-profile",
    name: "기본 색상 프로필",
    createdAt: new Date().toISOString(),
    whiteBalance: { r: 255, g: 255, b: 255 },
    samples: Object.entries(DEFAULT_COLOR_RGB).map(([color, rgb]) => ({
      color: color as StickerColor,
      rgb,
      lab: rgbToLab(rgb),
    })),
  };
}

export function calibrateColorProfile(samples: Array<{ color: StickerColor; rgb: RgbColor }>): ColorProfile {
  const white = samples.find((sample) => sample.color === "white")?.rgb ?? DEFAULT_COLOR_RGB.white;
  const normalizedSamples: ColorSample[] = samples.map((sample) => ({
    ...sample,
    lab: rgbToLab(applyWhiteBalance(sample.rgb, white)),
  }));

  return {
    id: `profile-${Date.now()}`,
    name: "사용자 보정 프로필",
    createdAt: new Date().toISOString(),
    whiteBalance: white,
    samples: normalizedSamples,
  };
}

export function updateColorProfileSample(profile: ColorProfile, color: StickerColor, rgb: RgbColor): ColorProfile {
  const sampleMap = new Map<StickerColor, RgbColor>(profile.samples.map((sample) => [sample.color, sample.rgb]));
  sampleMap.set(color, rgb);
  const nextProfile = calibrateColorProfile(
    Object.entries(DEFAULT_COLOR_RGB).map(([sampleColor, defaultRgb]) => ({
      color: sampleColor as StickerColor,
      rgb: sampleMap.get(sampleColor as StickerColor) ?? defaultRgb,
    })),
  );

  return {
    ...nextProfile,
    id: profile.id,
    name: profile.name,
    createdAt: profile.createdAt,
  };
}

export function classifyStickerColor(rgb: RgbColor, profile: ColorProfile): { color: StickerColor; confidence: number; distance: number } {
  const balanced = applyWhiteBalance(rgb, profile.whiteBalance);
  const sourceFeatures = getColorFeatures(balanced);
  const ranked = profile.samples
    .map((sample) => {
      const sampleRgb = applyWhiteBalance(sample.rgb, profile.whiteBalance);
      const sampleFeatures = getColorFeatures(sampleRgb);
      const distance = colorDistance(sourceFeatures, { ...sampleFeatures, lab: sample.lab }, sample.color);
      return {
        color: sample.color,
        distance,
      };
    })
    .toSorted((a, b) => a.distance - b.distance);

  const best = ranked[0];
  const second = ranked[1];
  const separation = second ? Math.max(second.distance - best.distance, 0) : 100;
  const absoluteFit = Math.max(0, 1 - best.distance / 130);
  const confidence = clampRatio(0.22 + Math.min(separation / 75, 1) * 0.56 + absoluteFit * 0.22);

  return {
    color: best.color,
    confidence,
    distance: best.distance,
  };
}

export function sampleNineGrid(imageData: ImageData): RgbColor[] {
  const samples: RgbColor[] = [];
  const cellWidth = imageData.width / 3;
  const cellHeight = imageData.height / 3;
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      samples.push(sampleRegion(imageData, col * cellWidth, row * cellHeight, cellWidth, cellHeight));
    }
  }
  return samples;
}

function sampleRegion(imageData: ImageData, x: number, y: number, width: number, height: number): RgbColor {
  const startX = Math.floor(x + width * 0.35);
  const endX = Math.floor(x + width * 0.65);
  const startY = Math.floor(y + height * 0.35);
  const endY = Math.floor(y + height * 0.65);
  const pixels: RgbColor[] = [];

  for (let py = startY; py < endY; py += 1) {
    for (let px = startX; px < endX; px += 1) {
      const offset = (py * imageData.width + px) * 4;
      pixels.push({
        r: imageData.data[offset],
        g: imageData.data[offset + 1],
        b: imageData.data[offset + 2],
      });
    }
  }

  return averageTrimmedPixels(pixels);
}

function averageTrimmedPixels(pixels: RgbColor[]): RgbColor {
  if (pixels.length === 0) return { r: 0, g: 0, b: 0 };

  const sorted = pixels.toSorted((a, b) => luminance(a) - luminance(b));
  const trim = Math.floor(sorted.length * 0.12);
  const trimmed = sorted.slice(trim, sorted.length - trim || sorted.length);
  const usable = trimmed.length > 0 ? trimmed : sorted;
  let r = 0;
  let g = 0;
  let b = 0;

  for (const pixel of usable) {
    r += pixel.r;
    g += pixel.g;
    b += pixel.b;
  }

  return {
    r: Math.round(r / usable.length),
    g: Math.round(g / usable.length),
    b: Math.round(b / usable.length),
  };
}

function applyWhiteBalance(rgb: RgbColor, white: RgbColor): RgbColor {
  return {
    r: clamp((rgb.r / Math.max(white.r, 1)) * 255),
    g: clamp((rgb.g / Math.max(white.g, 1)) * 255),
    b: clamp((rgb.b / Math.max(white.b, 1)) * 255),
  };
}

function rgbToLab(rgb: RgbColor): LabColor {
  const srgb = [rgb.r, rgb.g, rgb.b].map((value) => {
    const normalized = value / 255;
    return normalized > 0.04045 ? ((normalized + 0.055) / 1.055) ** 2.4 : normalized / 12.92;
  });

  const x = (srgb[0] * 0.4124 + srgb[1] * 0.3576 + srgb[2] * 0.1805) / 0.95047;
  const y = (srgb[0] * 0.2126 + srgb[1] * 0.7152 + srgb[2] * 0.0722) / 1.0;
  const z = (srgb[0] * 0.0193 + srgb[1] * 0.1192 + srgb[2] * 0.9505) / 1.08883;

  const fx = xyzPivot(x);
  const fy = xyzPivot(y);
  const fz = xyzPivot(z);

  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

function xyzPivot(value: number): number {
  return value > 0.008856 ? Math.cbrt(value) : 7.787 * value + 16 / 116;
}

interface HsvColor {
  hue: number;
  saturation: number;
  value: number;
}

interface RgbChromaticity {
  r: number;
  g: number;
  b: number;
}

interface ColorFeatures {
  lab: LabColor;
  hsv: HsvColor;
  chroma: RgbChromaticity;
}

function getColorFeatures(rgb: RgbColor): ColorFeatures {
  return {
    lab: rgbToLab(rgb),
    hsv: rgbToHsv(rgb),
    chroma: rgbToChromaticity(rgb),
  };
}

function colorDistance(source: ColorFeatures, sample: ColorFeatures, sampleColor: StickerColor): number {
  return (
    labDistance(source.lab, sample.lab) * 0.72 +
    chromaticityDistance(source.chroma, sample.chroma) * 90 +
    huePenalty(source.hsv, sample.hsv, sampleColor) +
    saturationValuePenalty(source.hsv, sample.hsv, sampleColor)
  );
}

function labDistance(first: LabColor, second: LabColor): number {
  return Math.hypot(first.l - second.l, first.a - second.a, first.b - second.b);
}

function rgbToHsv(rgb: RgbColor): HsvColor {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue = 0;

  if (delta !== 0) {
    if (max === r) {
      hue = 60 * (((g - b) / delta) % 6);
    } else if (max === g) {
      hue = 60 * ((b - r) / delta + 2);
    } else {
      hue = 60 * ((r - g) / delta + 4);
    }
  }

  return {
    hue: hue < 0 ? hue + 360 : hue,
    saturation: max === 0 ? 0 : delta / max,
    value: max,
  };
}

function huePenalty(source: HsvColor, sample: HsvColor, sampleColor: StickerColor): number {
  if (sampleColor === "white" || source.saturation < 0.16 || sample.saturation < 0.16) return 0;
  return hueDistance(source.hue, sample.hue) * SATURATED_HUE_WEIGHT[sampleColor];
}

function saturationValuePenalty(source: HsvColor, sample: HsvColor, sampleColor: StickerColor): number {
  if (sampleColor === "white") {
    return source.saturation * 76 + Math.max(0, 0.58 - source.value) * 24;
  }

  if (source.saturation < 0.13) return 34;

  return Math.abs(source.saturation - sample.saturation) * 8 + Math.abs(source.value - sample.value) * 4;
}

function hueDistance(first: number, second: number): number {
  const distance = Math.abs(first - second) % 360;
  return Math.min(distance, 360 - distance);
}

function rgbToChromaticity(rgb: RgbColor): RgbChromaticity {
  const total = Math.max(rgb.r + rgb.g + rgb.b, 1);
  return {
    r: rgb.r / total,
    g: rgb.g / total,
    b: rgb.b / total,
  };
}

function chromaticityDistance(first: RgbChromaticity, second: RgbChromaticity): number {
  return Math.hypot(first.r - second.r, first.g - second.g, first.b - second.b);
}

function luminance(rgb: RgbColor): number {
  return 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function clampRatio(value: number): number {
  return Math.max(0, Math.min(1, value));
}
