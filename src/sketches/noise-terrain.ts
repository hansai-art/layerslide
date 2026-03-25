import type { SketchModule, SketchParamDef } from "@/types/layerslide";

let w = 0;
let h = 0;

const defaultParams: Record<string, SketchParamDef> = {
  rows: { type: "number", label: "行數", default: 30, min: 10, max: 60, step: 5 },
  amplitude: { type: "number", label: "振幅", default: 40, min: 10, max: 100, step: 5 },
  speed: { type: "number", label: "速度", default: 0.003, min: 0.001, max: 0.01, step: 0.001 },
  color: { type: "color", label: "顏色", default: "0, 210, 190" },
  perspective: { type: "number", label: "透視", default: 0.6, min: 0.2, max: 1, step: 0.1 },
};

// Simple value noise
function noise2d(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

  const hash = (a: number, b: number) => {
    let h = a * 374761393 + b * 668265263 + 1376312589;
    h = (h ^ (h >> 13)) * 1274126177;
    return ((h ^ (h >> 16)) & 0x7fffffff) / 0x7fffffff;
  };

  const v00 = hash(ix, iy);
  const v10 = hash(ix + 1, iy);
  const v01 = hash(ix, iy + 1);
  const v11 = hash(ix + 1, iy + 1);

  const smoothX = fx * fx * (3 - 2 * fx);
  const smoothY = fy * fy * (3 - 2 * fy);

  return (
    v00 * (1 - smoothX) * (1 - smoothY) +
    v10 * smoothX * (1 - smoothY) +
    v01 * (1 - smoothX) * smoothY +
    v11 * smoothX * smoothY
  );
}

const noiseTerrain: SketchModule = {
  name: "noise-terrain",
  defaultParams,

  setup(canvas) {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  },

  draw(ctx, time, params) {
    const rows = (params.rows as number) ?? 30;
    const amplitude = (params.amplitude as number) ?? 40;
    const speed = (params.speed as number) ?? 0.003;
    const color = (params.color as string) ?? "0, 210, 190";
    const perspective = (params.perspective as number) ?? 0.6;

    ctx.fillStyle = "rgb(10, 12, 18)";
    ctx.fillRect(0, 0, w, h);

    const cols = 60;
    const t = time * speed;

    for (let row = 0; row < rows; row++) {
      const rowProgress = row / rows;
      const yBase = h * 0.3 + rowProgress * h * perspective;
      const scale = 0.3 + rowProgress * 0.7;
      const alpha = 0.1 + rowProgress * 0.5;

      ctx.beginPath();
      for (let col = 0; col <= cols; col++) {
        const x = (col / cols) * w;
        const n = noise2d(col * 0.15 + t, row * 0.2 + t * 0.5);
        const y = yBase - n * amplitude * scale;

        if (col === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.strokeStyle = `rgba(${color}, ${alpha})`;
      ctx.lineWidth = 1;
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

export default noiseTerrain;
