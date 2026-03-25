import type { SketchModule, SketchParamDef } from "@/types/layerslide";

let w = 0;
let h = 0;

const defaultParams: Record<string, SketchParamDef> = {
  sides: { type: "number", label: "邊數", default: 6, min: 3, max: 12, step: 1 },
  layers: { type: "number", label: "層數", default: 8, min: 3, max: 15, step: 1 },
  radius: { type: "number", label: "半徑", default: 200, min: 50, max: 400, step: 10 },
  rotationSpeed: { type: "number", label: "旋轉速度", default: 0.001, min: 0.0002, max: 0.005, step: 0.0002 },
  color1: { type: "color", label: "顏色 1", default: "0, 210, 190" },
  color2: { type: "color", label: "顏色 2", default: "130, 100, 255" },
  morphSpeed: { type: "number", label: "變形速度", default: 0.002, min: 0.0005, max: 0.01, step: 0.0005 },
};

function drawPolygon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  sides: number,
  rotation: number,
  morph: number
) {
  ctx.beginPath();
  for (let i = 0; i <= sides; i++) {
    const angle = (i / sides) * Math.PI * 2 + rotation;
    const r = radius * (1 + morph * Math.sin(angle * 3));
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

const geometricMorph: SketchModule = {
  name: "geometric-morph",
  defaultParams,

  setup(canvas) {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  },

  draw(ctx, time, params) {
    const sides = (params.sides as number) ?? 6;
    const layers = (params.layers as number) ?? 8;
    const radius = (params.radius as number) ?? 200;
    const rotationSpeed = (params.rotationSpeed as number) ?? 0.001;
    const color1 = (params.color1 as string) ?? "0, 210, 190";
    const color2 = (params.color2 as string) ?? "130, 100, 255";
    const morphSpeed = (params.morphSpeed as number) ?? 0.002;

    ctx.fillStyle = "rgba(10, 12, 18, 0.08)";
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const morph = Math.sin(time * morphSpeed) * 0.15;

    for (let i = 0; i < layers; i++) {
      const progress = i / (layers - 1);
      const r = radius * (0.3 + progress * 0.7);
      const rotation = time * rotationSpeed * (i % 2 === 0 ? 1 : -1) + (i * Math.PI) / layers;
      const alpha = 0.15 + 0.2 * (1 - progress);

      // Interpolate color
      const r1 = parseInt(color1.split(",")[0]) || 0;
      const g1 = parseInt(color1.split(",")[1]) || 210;
      const b1 = parseInt(color1.split(",")[2]) || 190;
      const r2 = parseInt(color2.split(",")[0]) || 130;
      const g2 = parseInt(color2.split(",")[1]) || 100;
      const b2 = parseInt(color2.split(",")[2]) || 255;

      const cr = Math.round(r1 + (r2 - r1) * progress);
      const cg = Math.round(g1 + (g2 - g1) * progress);
      const cb = Math.round(b1 + (b2 - b1) * progress);

      drawPolygon(ctx, cx, cy, r, sides, rotation, morph);
      ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  },

  updateParams() {},

  resize(newW, newH) {
    w = newW;
    h = newH;
  },

  destroy() {},
};

export default geometricMorph;
