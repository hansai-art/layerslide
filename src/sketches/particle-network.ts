import type { SketchModule, SketchParamDef } from "@/types/layerslide";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

let particles: Particle[] = [];
let w = 0;
let h = 0;

const defaultParams: Record<string, SketchParamDef> = {
  particleCount: { type: "number", label: "粒子數量", default: 80, min: 20, max: 300, step: 10 },
  lineDistance: { type: "number", label: "連線距離", default: 150, min: 50, max: 300, step: 10 },
  color: { type: "color", label: "顏色", default: "0, 230, 200" },
  speed: { type: "number", label: "速度", default: 0.5, min: 0.1, max: 2, step: 0.1 },
  particleSize: { type: "number", label: "粒子大小", default: 2, min: 0.5, max: 5, step: 0.5 },
};

let currentParams: Record<string, unknown> = {};

function initParticles(count: number, speed: number) {
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * speed,
    vy: (Math.random() - 0.5) * speed,
    size: Math.random() * 2 + 1,
  }));
}

const particleNetwork: SketchModule = {
  name: "particle-network",
  defaultParams,

  setup(canvas, params) {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    currentParams = { ...params };
    const count = (params.particleCount as number) ?? 80;
    const speed = (params.speed as number) ?? 0.5;
    initParticles(count, speed);
  },

  draw(ctx, _time, params) {
    const color = (params.color as string) ?? "0, 230, 200";
    const lineDistance = (params.lineDistance as number) ?? 150;
    const maxSize = (params.particleSize as number) ?? 2;

    ctx.fillStyle = "rgba(10, 12, 18, 0.15)";
    ctx.fillRect(0, 0, w, h);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (maxSize / 2), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color}, 0.8)`;
      ctx.fill();
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < lineDistance) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${color}, ${0.3 * (1 - dist / lineDistance)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  },

  updateParams(params) {
    const oldCount = currentParams.particleCount as number;
    const newCount = params.particleCount as number;
    const newSpeed = params.speed as number;
    if (newCount !== oldCount) {
      initParticles(newCount ?? 80, newSpeed ?? 0.5);
    }
    currentParams = { ...params };
  },

  resize(newW, newH) {
    w = newW;
    h = newH;
  },

  destroy() {
    particles = [];
  },
};

export default particleNetwork;
