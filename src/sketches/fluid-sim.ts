import type { SketchModule, SketchParamDef } from "@/types/layerslide";

let w = 0;
let h = 0;

interface FluidBlob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

let blobs: FluidBlob[] = [];

const defaultParams: Record<string, SketchParamDef> = {
  blobCount: { type: "number", label: "流體數量", default: 6, min: 3, max: 15, step: 1 },
  threshold: { type: "number", label: "閾值", default: 1, min: 0.5, max: 2, step: 0.1 },
  resolution: { type: "number", label: "解析度", default: 6, min: 3, max: 10, step: 1 },
  speed: { type: "number", label: "速度", default: 0.8, min: 0.2, max: 3, step: 0.2 },
  color1: { type: "color", label: "顏色 1", default: "0, 180, 220" },
  color2: { type: "color", label: "顏色 2", default: "180, 0, 255" },
};

let currentParams: Record<string, unknown> = {};

function initBlobs(count: number, speed: number) {
  blobs = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * speed,
    vy: (Math.random() - 0.5) * speed,
    radius: 80 + Math.random() * 120,
  }));
}

const fluidSim: SketchModule = {
  name: "fluid-sim",
  defaultParams,

  setup(canvas, params) {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    currentParams = { ...params };
    initBlobs(
      (params.blobCount as number) ?? 6,
      (params.speed as number) ?? 0.8
    );
  },

  draw(ctx, _time, params) {
    const threshold = (params.threshold as number) ?? 1;
    const resolution = (params.resolution as number) ?? 6;
    const color1 = (params.color1 as string) ?? "0, 180, 220";
    const color2 = (params.color2 as string) ?? "180, 0, 255";

    ctx.fillStyle = "rgb(10, 12, 18)";
    ctx.fillRect(0, 0, w, h);

    // Move blobs
    for (const blob of blobs) {
      blob.x += blob.vx;
      blob.y += blob.vy;
      if (blob.x < 0 || blob.x > w) blob.vx *= -1;
      if (blob.y < 0 || blob.y > h) blob.vy *= -1;
    }

    // Metaball field rendering
    const imgData = ctx.createImageData(
      Math.ceil(w / resolution),
      Math.ceil(h / resolution)
    );
    const pixels = imgData.data;

    const r1 = parseInt(color1.split(",")[0]) || 0;
    const g1 = parseInt(color1.split(",")[1]) || 180;
    const b1 = parseInt(color1.split(",")[2]) || 220;
    const r2 = parseInt(color2.split(",")[0]) || 180;
    const g2 = parseInt(color2.split(",")[1]) || 0;
    const b2 = parseInt(color2.split(",")[2]) || 255;

    for (let py = 0; py < imgData.height; py++) {
      for (let px = 0; px < imgData.width; px++) {
        const worldX = px * resolution;
        const worldY = py * resolution;

        let sum = 0;
        for (const blob of blobs) {
          const dx = worldX - blob.x;
          const dy = worldY - blob.y;
          sum += (blob.radius * blob.radius) / (dx * dx + dy * dy + 1);
        }

        const idx = (py * imgData.width + px) * 4;
        if (sum > threshold) {
          const t = Math.min((sum - threshold) / threshold, 1);
          pixels[idx] = Math.round(r1 + (r2 - r1) * t);
          pixels[idx + 1] = Math.round(g1 + (g2 - g1) * t);
          pixels[idx + 2] = Math.round(b1 + (b2 - b1) * t);
          pixels[idx + 3] = Math.round(50 + t * 150);
        }
      }
    }

    // Scale up the low-res image
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = imgData.width;
    tempCanvas.height = imgData.height;
    const tempCtx = tempCanvas.getContext("2d")!;
    tempCtx.putImageData(imgData, 0, 0);

    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(tempCanvas, 0, 0, w, h);
  },

  updateParams(params) {
    const oldCount = currentParams.blobCount as number;
    const newCount = params.blobCount as number;
    if (newCount !== oldCount) {
      initBlobs(newCount ?? 6, (params.speed as number) ?? 0.8);
    }
    currentParams = { ...params };
  },

  resize(newW, newH) {
    w = newW;
    h = newH;
  },

  destroy() {
    blobs = [];
  },
};

export default fluidSim;
