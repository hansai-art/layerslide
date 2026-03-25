import type { SketchModule, SketchParamDef } from "@/types/layerslide";

let w = 0;
let h = 0;
let columns: number[] = [];
let fontSize = 14;

const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF";

const defaultParams: Record<string, SketchParamDef> = {
  fontSize: { type: "number", label: "字體大小", default: 14, min: 8, max: 24, step: 2 },
  speed: { type: "number", label: "速度", default: 0.05, min: 0.01, max: 0.15, step: 0.01 },
  color: { type: "color", label: "顏色", default: "0, 255, 70" },
  density: { type: "number", label: "密度", default: 0.98, min: 0.9, max: 1, step: 0.005 },
};

const matrixRain: SketchModule = {
  name: "matrix-rain",
  defaultParams,

  setup(canvas, params) {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    fontSize = (params.fontSize as number) ?? 14;
    const colCount = Math.ceil(w / fontSize);
    columns = Array.from({ length: colCount }, () => Math.random() * h / fontSize);
  },

  draw(ctx, _time, params) {
    const color = (params.color as string) ?? "0, 255, 70";
    const density = (params.density as number) ?? 0.98;
    fontSize = (params.fontSize as number) ?? 14;

    ctx.fillStyle = "rgba(10, 12, 18, 0.05)";
    ctx.fillRect(0, 0, w, h);

    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < columns.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;
      const y = columns[i] * fontSize;

      // Brighter for the head
      const isHead = Math.random() > 0.9;
      ctx.fillStyle = isHead
        ? `rgba(${color}, 1)`
        : `rgba(${color}, 0.6)`;
      ctx.fillText(char, x, y);

      if (y > h && Math.random() > density) {
        columns[i] = 0;
      }
      columns[i]++;
    }
  },

  updateParams(params) {
    const newSize = (params.fontSize as number) ?? 14;
    if (newSize !== fontSize) {
      fontSize = newSize;
      const colCount = Math.ceil(w / fontSize);
      columns = Array.from({ length: colCount }, () => Math.random() * h / fontSize);
    }
  },

  resize(newW, newH) {
    w = newW;
    h = newH;
    const colCount = Math.ceil(w / fontSize);
    columns = Array.from({ length: colCount }, () => Math.random() * h / fontSize);
  },

  destroy() {
    columns = [];
  },
};

export default matrixRain;
