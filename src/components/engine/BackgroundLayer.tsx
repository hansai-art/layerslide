import { useEffect, useRef, useCallback } from "react";
import type { BackgroundConfig } from "@/types/layerslide";

interface BackgroundLayerProps {
  config: BackgroundConfig;
}

/** Layer 0 — Persistent background that never interrupts on slide change */
const BackgroundLayer = ({ config }: BackgroundLayerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const runParticleNetwork = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particleCount = (config.params?.particleCount as number) ?? 80;
    const lineDistance = (config.params?.lineDistance as number) ?? 150;
    const color = (config.params?.color as string) ?? "0, 230, 200";
    const speed = (config.params?.speed as number) ?? 0.5;

    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      size: Math.random() * 2 + 1,
    }));

    const draw = () => {
      ctx.fillStyle = "rgba(10, 12, 18, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
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

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  }, [config.params]);

  useEffect(() => {
    if (config.type === "generator" && config.sketch === "particle-network" && canvasRef.current) {
      runParticleNetwork(canvasRef.current);
    }

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [config, runParticleNetwork]);

  const opacity = config.opacity ?? 1;
  const blur = config.blur ?? 0;

  return (
    <div
      id="ls-background"
      className="fixed inset-0"
      style={{
        zIndex: 0,
        opacity,
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
      }}
    >
      {config.type === "generator" && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
      )}

      {config.type === "image" && config.src && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${config.src})` }}
        />
      )}

      {config.overlayColor && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: config.overlayColor }}
        />
      )}
    </div>
  );
};

export default BackgroundLayer;
