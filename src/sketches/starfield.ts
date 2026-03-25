import type { SketchModule, SketchParamDef } from "@/types/layerslide";

interface Star {
  x: number;
  y: number;
  z: number;
}

let stars: Star[] = [];
let w = 0;
let h = 0;
let cx = 0;
let cy = 0;

const defaultParams: Record<string, SketchParamDef> = {
  starCount: { type: "number", label: "星星數量", default: 400, min: 100, max: 1000, step: 50 },
  speed: { type: "number", label: "速度", default: 2, min: 0.5, max: 10, step: 0.5 },
  color: { type: "color", label: "顏色", default: "255, 255, 255" },
  maxDepth: { type: "number", label: "深度", default: 1000, min: 300, max: 2000, step: 100 },
  trailLength: { type: "number", label: "尾跡長度", default: 3, min: 0, max: 10, step: 1 },
};

let currentParams: Record<string, unknown> = {};

function initStars(count: number, maxDepth: number) {
  stars = Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * w * 2,
    y: (Math.random() - 0.5) * h * 2,
    z: Math.random() * maxDepth,
  }));
}

const starfield: SketchModule = {
  name: "starfield",
  defaultParams,

  setup(canvas, params) {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    cx = w / 2;
    cy = h / 2;
    currentParams = { ...params };
    initStars(
      (params.starCount as number) ?? 400,
      (params.maxDepth as number) ?? 1000
    );
  },

  draw(ctx, _time, params) {
    const speed = (params.speed as number) ?? 2;
    const color = (params.color as string) ?? "255, 255, 255";
    const maxDepth = (params.maxDepth as number) ?? 1000;
    const trailLength = (params.trailLength as number) ?? 3;

    ctx.fillStyle = "rgba(10, 12, 18, 0.2)";
    ctx.fillRect(0, 0, w, h);

    for (const star of stars) {
      star.z -= speed;
      if (star.z <= 0) {
        star.x = (Math.random() - 0.5) * w * 2;
        star.y = (Math.random() - 0.5) * h * 2;
        star.z = maxDepth;
      }

      const sx = (star.x / star.z) * cx + cx;
      const sy = (star.y / star.z) * cy + cy;
      const size = Math.max(0.5, (1 - star.z / maxDepth) * 3);
      const alpha = 1 - star.z / maxDepth;

      if (trailLength > 0) {
        const prevZ = star.z + speed * trailLength;
        const px = (star.x / prevZ) * cx + cx;
        const py = (star.y / prevZ) * cy + cy;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = `rgba(${color}, ${alpha * 0.5})`;
        ctx.lineWidth = size * 0.5;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color}, ${alpha})`;
      ctx.fill();
    }
  },

  updateParams(params) {
    const oldCount = currentParams.starCount as number;
    const newCount = params.starCount as number;
    if (newCount !== oldCount) {
      initStars(newCount ?? 400, (params.maxDepth as number) ?? 1000);
    }
    currentParams = { ...params };
  },

  resize(newW, newH) {
    w = newW;
    h = newH;
    cx = w / 2;
    cy = h / 2;
  },

  destroy() {
    stars = [];
  },
};

export default starfield;
