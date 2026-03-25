import type { SketchModule, SketchParamDef } from "@/types/layerslide";

interface Bokeh {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  hue: number;
  alpha: number;
  pulseSpeed: number;
  pulsePhase: number;
}

let bokehs: Bokeh[] = [];
let w = 0;
let h = 0;

const defaultParams: Record<string, SketchParamDef> = {
  count: { type: "number", label: "光點數量", default: 30, min: 5, max: 80, step: 5 },
  minRadius: { type: "number", label: "最小半徑", default: 20, min: 5, max: 60, step: 5 },
  maxRadius: { type: "number", label: "最大半徑", default: 80, min: 30, max: 200, step: 10 },
  speed: { type: "number", label: "速度", default: 0.3, min: 0.05, max: 1, step: 0.05 },
  hueStart: { type: "number", label: "色相起始", default: 170, min: 0, max: 360, step: 10 },
  hueRange: { type: "number", label: "色相範圍", default: 100, min: 20, max: 360, step: 10 },
  maxAlpha: { type: "number", label: "最大透明度", default: 0.15, min: 0.05, max: 0.4, step: 0.05 },
};

let currentParams: Record<string, unknown> = {};

function initBokehs(count: number, minR: number, maxR: number, speed: number, hueStart: number, hueRange: number, maxAlpha: number) {
  bokehs = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: minR + Math.random() * (maxR - minR),
    vx: (Math.random() - 0.5) * speed,
    vy: (Math.random() - 0.5) * speed,
    hue: hueStart + Math.random() * hueRange,
    alpha: 0.05 + Math.random() * maxAlpha,
    pulseSpeed: 0.005 + Math.random() * 0.01,
    pulsePhase: Math.random() * Math.PI * 2,
  }));
}

const bokehLights: SketchModule = {
  name: "bokeh-lights",
  defaultParams,

  setup(canvas, params) {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    currentParams = { ...params };
    initBokehs(
      (params.count as number) ?? 30,
      (params.minRadius as number) ?? 20,
      (params.maxRadius as number) ?? 80,
      (params.speed as number) ?? 0.3,
      (params.hueStart as number) ?? 170,
      (params.hueRange as number) ?? 100,
      (params.maxAlpha as number) ?? 0.15,
    );
  },

  draw(ctx, time, params) {
    const maxAlpha = (params.maxAlpha as number) ?? 0.15;

    ctx.fillStyle = "rgba(10, 12, 18, 0.05)";
    ctx.fillRect(0, 0, w, h);

    for (const b of bokehs) {
      b.x += b.vx;
      b.y += b.vy;
      if (b.x < -b.r) b.x = w + b.r;
      if (b.x > w + b.r) b.x = -b.r;
      if (b.y < -b.r) b.y = h + b.r;
      if (b.y > h + b.r) b.y = -b.r;

      const pulse = 0.6 + 0.4 * Math.sin(time * b.pulseSpeed + b.pulsePhase);
      const alpha = b.alpha * pulse * (maxAlpha / 0.15);

      const gradient = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      gradient.addColorStop(0, `hsla(${b.hue}, 70%, 60%, ${alpha})`);
      gradient.addColorStop(0.5, `hsla(${b.hue}, 60%, 50%, ${alpha * 0.5})`);
      gradient.addColorStop(1, `hsla(${b.hue}, 50%, 40%, 0)`);

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  },

  updateParams(params) {
    const oldCount = currentParams.count as number;
    const newCount = params.count as number;
    if (newCount !== oldCount) {
      initBokehs(
        newCount ?? 30,
        (params.minRadius as number) ?? 20,
        (params.maxRadius as number) ?? 80,
        (params.speed as number) ?? 0.3,
        (params.hueStart as number) ?? 170,
        (params.hueRange as number) ?? 100,
        (params.maxAlpha as number) ?? 0.15,
      );
    }
    currentParams = { ...params };
  },

  resize(newW, newH) {
    w = newW;
    h = newH;
  },

  destroy() {
    bokehs = [];
  },
};

export default bokehLights;
