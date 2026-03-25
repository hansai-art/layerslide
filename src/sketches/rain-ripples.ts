import type { SketchModule, SketchParamDef } from "@/types/layerslide";

interface RainDrop {
  x: number;
  y: number;
  speed: number;
  length: number;
  opacity: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  lineWidth: number;
  rings: number;
}

let w = 0;
let h = 0;
let drops: RainDrop[] = [];
let ripples: Ripple[] = [];
let currentParams: Record<string, unknown> = {};
let frameCount = 0;
let lightningFlash = 0;
let lastDropTime = 0;

// Pre-computed water surface wave offsets
let wavePhase = 0;

const defaultParams: Record<string, SketchParamDef> = {
  dropRate: { type: "number", label: "雨滴頻率", default: 4, min: 1, max: 10, step: 1 },
  rippleSpeed: { type: "number", label: "漣漪速度", default: 1.5, min: 0.5, max: 3, step: 0.1 },
  maxRipples: { type: "number", label: "最大漣漪數", default: 25, min: 10, max: 50, step: 5 },
  color: { type: "color", label: "水面顏色", default: "100, 150, 255" },
  rainSpeed: { type: "number", label: "雨滴速度", default: 12, min: 5, max: 20, step: 1 },
  lightning: { type: "boolean", label: "閃電效果", default: false },
};

const WATER_LINE_RATIO = 0.4; // Water starts at 40% from top

function spawnDrop() {
  drops.push({
    x: Math.random() * w,
    y: -10,
    speed: 0.8 + Math.random() * 0.4, // speed multiplier
    length: 8 + Math.random() * 12,
    opacity: 0.3 + Math.random() * 0.5,
  });
}

function spawnRipple(x: number, y: number) {
  const maxRippleCount = (currentParams.maxRipples as number) ?? 25;
  if (ripples.length >= maxRippleCount) return;

  ripples.push({
    x,
    y,
    radius: 2,
    maxRadius: 40 + Math.random() * 60,
    opacity: 0.7 + Math.random() * 0.3,
    lineWidth: 1.5,
    rings: 3 + Math.floor(Math.random() * 2),
  });
}

function drawWaterSurface(ctx: CanvasRenderingContext2D, color: string) {
  const waterY = h * WATER_LINE_RATIO;

  // Water gradient background
  const grad = ctx.createLinearGradient(0, waterY, 0, h);
  grad.addColorStop(0, `rgba(${color}, 0.08)`);
  grad.addColorStop(0.3, `rgba(${color}, 0.05)`);
  grad.addColorStop(1, `rgba(20, 30, 50, 0.1)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, waterY, w, h - waterY);

  // Subtle wave lines on the surface
  ctx.strokeStyle = `rgba(${color}, 0.06)`;
  ctx.lineWidth = 1;
  for (let row = 0; row < 8; row++) {
    const rowY = waterY + row * ((h - waterY) / 8);
    ctx.beginPath();
    for (let x = 0; x <= w; x += 4) {
      const waveY =
        rowY +
        Math.sin(x * 0.01 + wavePhase + row * 0.8) * 2 +
        Math.sin(x * 0.025 + wavePhase * 1.3 + row) * 1;
      if (x === 0) ctx.moveTo(x, waveY);
      else ctx.lineTo(x, waveY);
    }
    ctx.stroke();
  }
}

function drawLightning(ctx: CanvasRenderingContext2D) {
  if (lightningFlash <= 0) return;

  // Screen flash
  ctx.fillStyle = `rgba(200, 210, 255, ${lightningFlash * 0.15})`;
  ctx.fillRect(0, 0, w, h);

  // Draw a lightning bolt if flash is strong
  if (lightningFlash > 0.7) {
    const startX = w * 0.2 + Math.random() * w * 0.6;
    let boltX = startX;
    let boltY = 0;
    const endY = h * WATER_LINE_RATIO * 0.7;

    ctx.beginPath();
    ctx.moveTo(boltX, boltY);

    while (boltY < endY) {
      boltX += (Math.random() - 0.5) * 40;
      boltY += 10 + Math.random() * 20;
      ctx.lineTo(boltX, boltY);

      // Occasional branch
      if (Math.random() < 0.2) {
        const branchLen = 20 + Math.random() * 30;
        const branchDir = Math.random() < 0.5 ? -1 : 1;
        ctx.moveTo(boltX, boltY);
        ctx.lineTo(
          boltX + branchDir * branchLen * 0.7,
          boltY + branchLen,
        );
        ctx.moveTo(boltX, boltY);
      }
    }

    ctx.strokeStyle = `rgba(220, 230, 255, ${lightningFlash * 0.9})`;
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(180, 200, 255, 0.8)";
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner bright core
    ctx.strokeStyle = `rgba(255, 255, 255, ${lightningFlash * 0.7})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  lightningFlash *= 0.85;
  if (lightningFlash < 0.01) lightningFlash = 0;
}

const rainRipples: SketchModule = {
  name: "rain-ripples",
  defaultParams,

  setup(canvas, params) {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    currentParams = { ...params };
    drops = [];
    ripples = [];
    frameCount = 0;
    lightningFlash = 0;
    lastDropTime = 0;
    wavePhase = 0;
  },

  draw(ctx, time, params) {
    const dropRate = (params.dropRate as number) ?? 4;
    const rippleSpeed = (params.rippleSpeed as number) ?? 1.5;
    const color = (params.color as string) ?? "100, 150, 255";
    const rainSpeed = (params.rainSpeed as number) ?? 12;
    const lightning = (params.lightning as boolean) ?? false;

    frameCount++;
    wavePhase += 0.015;

    // Background clear with trail
    ctx.fillStyle = "rgba(10, 12, 18, 0.2)";
    ctx.fillRect(0, 0, w, h);

    // Dark sky gradient
    if (frameCount % 3 === 0) {
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * WATER_LINE_RATIO);
      skyGrad.addColorStop(0, "rgba(8, 10, 15, 0.05)");
      skyGrad.addColorStop(1, "rgba(15, 20, 30, 0.03)");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * WATER_LINE_RATIO);
    }

    // Water surface
    drawWaterSurface(ctx, color);

    // Spawn new drops based on rate
    const dropInterval = 1000 / dropRate; // ms between drops
    const now = time;
    while (now - lastDropTime > dropInterval) {
      spawnDrop();
      lastDropTime += dropInterval;
    }
    // Prevent catch-up burst on first frame
    if (lastDropTime === 0) lastDropTime = now;

    // Lightning trigger
    if (lightning && Math.random() < 0.002) {
      lightningFlash = 1;
    }

    const waterY = h * WATER_LINE_RATIO;

    // Update and draw rain drops
    const aliveDrops: RainDrop[] = [];
    for (const d of drops) {
      d.y += rainSpeed * d.speed;

      // Check if drop hits water
      if (d.y >= waterY + Math.random() * (h - waterY) * 0.3) {
        spawnRipple(d.x, d.y);
        continue; // drop is consumed
      }

      // Draw rain streak
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - 0.5, d.y - d.length);
      ctx.strokeStyle = `rgba(180, 200, 230, ${d.opacity * 0.5})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      if (d.y < h + 20) {
        aliveDrops.push(d);
      }
    }
    drops = aliveDrops;

    // Update and draw ripples
    const aliveRipples: Ripple[] = [];
    for (const r of ripples) {
      r.radius += rippleSpeed;
      r.opacity *= 0.985;
      r.lineWidth *= 0.995;

      if (r.radius >= r.maxRadius || r.opacity < 0.02) continue;

      // Draw concentric rings
      for (let ring = 0; ring < r.rings; ring++) {
        const ringRadius = r.radius - ring * 8;
        if (ringRadius <= 0) continue;

        const ringOpacity = r.opacity * (1 - ring * 0.3) * (1 - ringRadius / r.maxRadius);
        if (ringOpacity <= 0) continue;

        ctx.beginPath();
        // Slight ellipse to simulate perspective
        ctx.ellipse(r.x, r.y, ringRadius, ringRadius * 0.4, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${color}, ${ringOpacity * 0.5})`;
        ctx.lineWidth = r.lineWidth * (1 - ring * 0.2);
        ctx.stroke();
      }

      // Small splash highlight at center when ripple is new
      if (r.radius < 8) {
        ctx.beginPath();
        ctx.arc(r.x, r.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${r.opacity * 0.4})`;
        ctx.fill();
      }

      aliveRipples.push(r);
    }
    ripples = aliveRipples;

    // Lightning effect on top
    drawLightning(ctx);
  },

  updateParams(params) {
    currentParams = { ...params };
  },

  resize(newW, newH) {
    w = newW;
    h = newH;
  },

  destroy() {
    drops = [];
    ripples = [];
    frameCount = 0;
    lightningFlash = 0;
    lastDropTime = 0;
  },
};

export default rainRipples;
