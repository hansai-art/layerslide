import type { SketchModule, SketchParamDef } from "@/types/layerslide";

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

let w = 0;
let h = 0;
let stars: Star[] = [];
let currentParams: Record<string, unknown> = {};
let time = 0;

const defaultParams: Record<string, SketchParamDef> = {
  bandCount: { type: "number", label: "極光帶數量", default: 5, min: 3, max: 8, step: 1 },
  speed: { type: "number", label: "飄動速度", default: 0.003, min: 0.001, max: 0.01, step: 0.001 },
  intensity: { type: "number", label: "亮度", default: 0.7, min: 0.3, max: 1, step: 0.05 },
  color: { type: "color", label: "主色調", default: "100, 255, 150" },
  starCount: { type: "number", label: "星星數量", default: 150, min: 50, max: 300, step: 10 },
};

function initStars(count: number) {
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h * 0.5,
    size: Math.random() * 1.8 + 0.3,
    brightness: Math.random() * 0.7 + 0.3,
    twinkleSpeed: Math.random() * 0.02 + 0.005,
    twinkleOffset: Math.random() * Math.PI * 2,
  }));
}

function drawStars(ctx: CanvasRenderingContext2D, t: number) {
  for (const s of stars) {
    const twinkle = 0.5 + 0.5 * Math.sin(t * s.twinkleSpeed * 60 + s.twinkleOffset);
    const alpha = s.brightness * twinkle;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 240, ${alpha})`;
    ctx.fill();
  }
}

function drawAurora(
  ctx: CanvasRenderingContext2D,
  t: number,
  bandCount: number,
  intensity: number,
  _color: string,
) {
  // Aurora hue palettes: green, teal, blue-purple, pink
  const hues = [125, 135, 160, 200, 240, 270, 300, 130];

  for (let b = 0; b < bandCount; b++) {
    const bandPhase = (b / bandCount) * Math.PI * 2;
    const hue = hues[b % hues.length];
    const baseY = h * 0.25 + (b / bandCount) * h * 0.35;

    // Draw curtain as vertical strips
    const segments = Math.ceil(w / 3);
    ctx.beginPath();

    // Build curtain top edge using layered sine waves
    const topPoints: number[] = [];
    const bottomPoints: number[] = [];
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * w;
      const normX = x / w;

      // Multiple sine waves for organic curtain shape
      const wave1 = Math.sin(normX * 3 + t * 0.7 + bandPhase) * h * 0.08;
      const wave2 = Math.sin(normX * 5.3 - t * 1.1 + bandPhase * 1.3) * h * 0.04;
      const wave3 = Math.sin(normX * 8.7 + t * 0.5 + bandPhase * 0.7) * h * 0.02;
      const wave4 = Math.sin(normX * 1.2 + t * 0.3 + b * 1.5) * h * 0.06;

      const topY = baseY + wave1 + wave2 + wave3 + wave4;
      const curtainHeight = h * 0.18 + Math.sin(normX * 2.1 + t * 0.4 + bandPhase) * h * 0.06;
      const bottomY = topY + curtainHeight;

      topPoints.push(topY);
      bottomPoints.push(bottomY);
    }

    // Draw the aurora band with vertical gradient
    for (let i = 0; i < segments; i++) {
      const x = (i / segments) * w;
      const nextX = ((i + 1) / segments) * w;
      const stripW = nextX - x + 1;

      const topY = topPoints[i];
      const bottomY = bottomPoints[i];
      const curtainH = bottomY - topY;

      // Shimmer: per-strip alpha variation
      const shimmer = 0.7 + 0.3 * Math.sin(i * 0.5 + t * 3 + bandPhase);
      const flicker = 0.85 + 0.15 * Math.random();
      const alpha = intensity * 0.15 * shimmer * flicker;

      // Vertical gradient for this strip
      const grad = ctx.createLinearGradient(x, topY, x, bottomY);
      const sat = 70 + 20 * Math.sin(i * 0.1 + t);
      const light = 55 + 15 * Math.sin(i * 0.15 + t * 0.8);
      grad.addColorStop(0, `hsla(${hue}, ${sat}%, ${light}%, 0)`);
      grad.addColorStop(0.2, `hsla(${hue}, ${sat}%, ${light}%, ${alpha * 0.4})`);
      grad.addColorStop(0.5, `hsla(${hue}, ${sat + 10}%, ${light + 10}%, ${alpha * 0.9})`);
      grad.addColorStop(0.8, `hsla(${hue}, ${sat + 15}%, ${light + 15}%, ${alpha})`);
      grad.addColorStop(1, `hsla(${hue + 20}, ${sat}%, ${light + 5}%, ${alpha * 0.3})`);

      ctx.fillStyle = grad;
      ctx.fillRect(x, topY, stripW, curtainH);
    }

    // Add a bright glow line along the bottom edge of each band
    ctx.beginPath();
    ctx.moveTo(0, bottomPoints[0]);
    for (let i = 1; i <= segments; i++) {
      const x = (i / segments) * w;
      ctx.lineTo(x, bottomPoints[i]);
    }
    const glowAlpha = intensity * 0.12 * (0.8 + 0.2 * Math.sin(t * 2 + bandPhase));
    ctx.strokeStyle = `hsla(${hue}, 80%, 70%, ${glowAlpha})`;
    ctx.lineWidth = 2;
    ctx.shadowColor = `hsla(${hue}, 90%, 60%, ${glowAlpha})`;
    ctx.shadowBlur = 20;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

const auroraBorealis: SketchModule = {
  name: "aurora-borealis",
  defaultParams,

  setup(canvas, params) {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    currentParams = { ...params };
    time = 0;
    const starCount = (params.starCount as number) ?? 150;
    initStars(starCount);
  },

  draw(ctx, _time, params) {
    const bandCount = (params.bandCount as number) ?? 5;
    const speed = (params.speed as number) ?? 0.003;
    const intensity = (params.intensity as number) ?? 0.7;
    const color = (params.color as string) ?? "100, 255, 150";

    time += speed;

    // Dark sky background with subtle fade
    ctx.fillStyle = "rgba(10, 12, 18, 0.12)";
    ctx.fillRect(0, 0, w, h);

    // Draw a very faint horizon glow
    const horizonGrad = ctx.createLinearGradient(0, h * 0.7, 0, h);
    horizonGrad.addColorStop(0, "rgba(10, 12, 18, 0)");
    horizonGrad.addColorStop(1, `rgba(15, 25, 20, 0.05)`);
    ctx.fillStyle = horizonGrad;
    ctx.fillRect(0, h * 0.7, w, h * 0.3);

    drawStars(ctx, time);
    drawAurora(ctx, time, bandCount, intensity, color);
  },

  updateParams(params) {
    const oldStarCount = currentParams.starCount as number;
    const newStarCount = params.starCount as number;
    if (newStarCount !== oldStarCount) {
      initStars(newStarCount ?? 150);
    }
    currentParams = { ...params };
  },

  resize(newW, newH) {
    w = newW;
    h = newH;
    const starCount = (currentParams.starCount as number) ?? 150;
    initStars(starCount);
  },

  destroy() {
    stars = [];
    time = 0;
  },
};

export default auroraBorealis;
