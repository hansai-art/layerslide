import type { SketchModule, SketchParamDef } from "@/types/layerslide";

let w = 0;
let h = 0;

const defaultParams: Record<string, SketchParamDef> = {
  layers: { type: "number", label: "波浪層數", default: 5, min: 2, max: 10, step: 1 },
  amplitude: { type: "number", label: "振幅", default: 60, min: 10, max: 150, step: 5 },
  frequency: { type: "number", label: "頻率", default: 0.005, min: 0.001, max: 0.02, step: 0.001 },
  speed: { type: "number", label: "速度", default: 0.02, min: 0.005, max: 0.1, step: 0.005 },
  color1: { type: "color", label: "顏色 1", default: "0, 210, 190" },
  color2: { type: "color", label: "顏色 2", default: "130, 100, 255" },
};

const waveGradient: SketchModule = {
  name: "wave-gradient",
  defaultParams,

  setup(canvas) {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  },

  draw(ctx, time, params) {
    const layers = (params.layers as number) ?? 5;
    const amplitude = (params.amplitude as number) ?? 60;
    const frequency = (params.frequency as number) ?? 0.005;
    const speed = (params.speed as number) ?? 0.02;
    const color1 = (params.color1 as string) ?? "0, 210, 190";
    const color2 = (params.color2 as string) ?? "130, 100, 255";

    // Dark background
    ctx.fillStyle = "rgb(10, 12, 18)";
    ctx.fillRect(0, 0, w, h);

    for (let layer = 0; layer < layers; layer++) {
      const progress = layer / (layers - 1);
      const yBase = h * 0.3 + (h * 0.5 * layer) / layers;
      const alpha = 0.15 + 0.1 * (1 - progress);
      const phaseOffset = layer * 0.8;

      // Interpolate color
      const r1 = parseInt(color1.split(",")[0]) || 0;
      const g1 = parseInt(color1.split(",")[1]) || 210;
      const b1 = parseInt(color1.split(",")[2]) || 190;
      const r2 = parseInt(color2.split(",")[0]) || 130;
      const g2 = parseInt(color2.split(",")[1]) || 100;
      const b2 = parseInt(color2.split(",")[2]) || 255;

      const r = Math.round(r1 + (r2 - r1) * progress);
      const g = Math.round(g1 + (g2 - g1) * progress);
      const b = Math.round(b1 + (b2 - b1) * progress);

      ctx.beginPath();
      ctx.moveTo(0, h);

      for (let x = 0; x <= w; x += 4) {
        const y =
          yBase +
          Math.sin(x * frequency + time * speed + phaseOffset) * amplitude +
          Math.sin(x * frequency * 2.5 + time * speed * 0.7 + phaseOffset * 1.3) * (amplitude * 0.3);
        ctx.lineTo(x, y);
      }

      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.fill();
    }
  },

  updateParams() {},

  resize(newW, newH) {
    w = newW;
    h = newH;
  },

  destroy() {},
};

export default waveGradient;
