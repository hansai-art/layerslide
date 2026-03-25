import type { SketchModule, SketchParamDef } from "@/types/layerslide";

interface GalaxyStar {
  angle: number;       // base angle on spiral
  radius: number;      // distance from center
  offset: number;      // perpendicular offset from arm
  size: number;
  brightness: number;
  hue: number;         // color variation
  speed: number;       // orbital speed multiplier
}

interface Nebula {
  angle: number;
  radius: number;
  size: number;
  hue: number;
  alpha: number;
}

let w = 0;
let h = 0;
let armStars: GalaxyStar[] = [];
let fieldStars: { x: number; y: number; size: number; brightness: number }[] = [];
let nebulae: Nebula[] = [];
let currentParams: Record<string, unknown> = {};
let rotation = 0;

const defaultParams: Record<string, SketchParamDef> = {
  armCount: { type: "number", label: "旋臂數量", default: 3, min: 2, max: 6, step: 1 },
  starCount: { type: "number", label: "星星數量", default: 1500, min: 500, max: 3000, step: 100 },
  rotationSpeed: { type: "number", label: "旋轉速度", default: 0.0005, min: 0.0001, max: 0.002, step: 0.0001 },
  spread: { type: "number", label: "旋臂擴散", default: 0.4, min: 0.2, max: 0.8, step: 0.05 },
  coreSize: { type: "number", label: "核心大小", default: 40, min: 20, max: 80, step: 5 },
  color: { type: "color", label: "旋臂色調", default: "200, 180, 255" },
};

function initGalaxy(starCount: number, armCount: number, spread: number) {
  const maxRadius = Math.min(w, h) * 0.42;

  // Arm stars following logarithmic spiral
  armStars = [];
  const starsPerArm = Math.floor(starCount / armCount);
  for (let arm = 0; arm < armCount; arm++) {
    const armAngle = (arm / armCount) * Math.PI * 2;
    for (let i = 0; i < starsPerArm; i++) {
      const t = Math.random();
      const radius = t * maxRadius;
      // Logarithmic spiral: angle increases with log of radius
      const spiralAngle = armAngle + Math.log(1 + radius * 0.02) * 2.5;
      // Gaussian-like offset from arm center
      const offsetAngle = (Math.random() - 0.5) * spread * (1 + t * 0.5);
      const offsetRadius = (Math.random() - 0.5) * spread * maxRadius * 0.15;

      // Inner stars: brighter, yellower. Outer stars: dimmer, bluer
      const innerFactor = 1 - t;
      const hue = 40 + t * 180; // yellow (40) to blue (220)

      armStars.push({
        angle: spiralAngle + offsetAngle,
        radius: radius + offsetRadius,
        offset: offsetAngle,
        size: (Math.random() * 1.5 + 0.3) * (1 + innerFactor * 0.8),
        brightness: (Math.random() * 0.5 + 0.3) * (0.4 + innerFactor * 0.6),
        hue,
        speed: 1 / (0.5 + radius * 0.01), // inner stars orbit faster
      });
    }
  }

  // Field stars (scattered outside galaxy)
  fieldStars = Array.from({ length: 80 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    size: Math.random() * 1.2 + 0.2,
    brightness: Math.random() * 0.4 + 0.1,
  }));

  // Nebula clouds along arms
  nebulae = [];
  for (let arm = 0; arm < armCount; arm++) {
    const armAngle = (arm / armCount) * Math.PI * 2;
    for (let i = 0; i < 8; i++) {
      const t = Math.random() * 0.8 + 0.1;
      const radius = t * maxRadius;
      const spiralAngle = armAngle + Math.log(1 + radius * 0.02) * 2.5;
      nebulae.push({
        angle: spiralAngle + (Math.random() - 0.5) * spread * 0.5,
        radius,
        size: 20 + Math.random() * 40,
        hue: 200 + Math.random() * 80,
        alpha: 0.02 + Math.random() * 0.04,
      });
    }
  }
}

const spiralGalaxy: SketchModule = {
  name: "spiral-galaxy",
  defaultParams,

  setup(canvas, params) {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    currentParams = { ...params };
    rotation = 0;
    const starCount = (params.starCount as number) ?? 1500;
    const armCount = (params.armCount as number) ?? 3;
    const spread = (params.spread as number) ?? 0.4;
    initGalaxy(starCount, armCount, spread);
  },

  draw(ctx, _time, params) {
    const rotationSpeed = (params.rotationSpeed as number) ?? 0.0005;
    const coreSize = (params.coreSize as number) ?? 40;

    rotation += rotationSpeed;

    const cx = w / 2;
    const cy = h / 2;

    // Clear with slight trail
    ctx.fillStyle = "rgba(10, 12, 18, 0.15)";
    ctx.fillRect(0, 0, w, h);

    // Field stars (static background)
    for (const s of fieldStars) {
      const flicker = 0.7 + 0.3 * Math.sin(rotation * 200 + s.x * 0.1 + s.y * 0.1);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 210, 255, ${s.brightness * flicker})`;
      ctx.fill();
    }

    // Nebula clouds
    for (const n of nebulae) {
      const angle = n.angle + rotation;
      const nx = cx + Math.cos(angle) * n.radius;
      const ny = cy + Math.sin(angle) * n.radius;

      const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, n.size);
      grad.addColorStop(0, `hsla(${n.hue}, 60%, 50%, ${n.alpha})`);
      grad.addColorStop(0.5, `hsla(${n.hue}, 50%, 40%, ${n.alpha * 0.5})`);
      grad.addColorStop(1, `hsla(${n.hue}, 40%, 30%, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(nx, ny, n.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Arm stars
    for (const s of armStars) {
      const angle = s.angle + rotation * s.speed;
      const sx = cx + Math.cos(angle) * s.radius;
      const sy = cy + Math.sin(angle) * s.radius;

      // Skip off-screen stars
      if (sx < -10 || sx > w + 10 || sy < -10 || sy > h + 10) continue;

      const sat = s.hue < 100 ? 40 : 60;
      const light = 60 + s.brightness * 30;
      ctx.beginPath();
      ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue}, ${sat}%, ${light}%, ${s.brightness})`;
      ctx.fill();
    }

    // Central core glow (layered radial gradients)
    const coreGrad1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize * 3);
    coreGrad1.addColorStop(0, "rgba(255, 250, 230, 0.25)");
    coreGrad1.addColorStop(0.2, "rgba(255, 230, 180, 0.12)");
    coreGrad1.addColorStop(0.5, "rgba(220, 200, 160, 0.04)");
    coreGrad1.addColorStop(1, "rgba(200, 180, 150, 0)");
    ctx.fillStyle = coreGrad1;
    ctx.beginPath();
    ctx.arc(cx, cy, coreSize * 3, 0, Math.PI * 2);
    ctx.fill();

    const coreGrad2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize);
    coreGrad2.addColorStop(0, "rgba(255, 255, 240, 0.6)");
    coreGrad2.addColorStop(0.3, "rgba(255, 240, 200, 0.3)");
    coreGrad2.addColorStop(0.7, "rgba(255, 220, 180, 0.08)");
    coreGrad2.addColorStop(1, "rgba(255, 200, 150, 0)");
    ctx.fillStyle = coreGrad2;
    ctx.beginPath();
    ctx.arc(cx, cy, coreSize, 0, Math.PI * 2);
    ctx.fill();
  },

  updateParams(params) {
    const oldCount = currentParams.starCount as number;
    const newCount = params.starCount as number;
    const oldArms = currentParams.armCount as number;
    const newArms = params.armCount as number;
    const oldSpread = currentParams.spread as number;
    const newSpread = params.spread as number;

    if (newCount !== oldCount || newArms !== oldArms || newSpread !== oldSpread) {
      initGalaxy(newCount ?? 1500, newArms ?? 3, newSpread ?? 0.4);
    }
    currentParams = { ...params };
  },

  resize(newW, newH) {
    w = newW;
    h = newH;
    const starCount = (currentParams.starCount as number) ?? 1500;
    const armCount = (currentParams.armCount as number) ?? 3;
    const spread = (currentParams.spread as number) ?? 0.4;
    initGalaxy(starCount, armCount, spread);
  },

  destroy() {
    armStars = [];
    fieldStars = [];
    nebulae = [];
    rotation = 0;
  },
};

export default spiralGalaxy;
