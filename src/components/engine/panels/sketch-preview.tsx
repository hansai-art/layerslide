import { useEffect, useRef } from "react";
import { getSketch } from "@/sketches/registry";

interface SketchPreviewProps {
  sketchName: string;
  width?: number;
  height?: number;
}

/** Renders a tiny canvas preview of a sketch for the picker */
const SketchPreview = ({ sketchName, width = 120, height = 68 }: SketchPreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const sketch = getSketch(sketchName);
    if (!sketch) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Build reduced params from defaults
    const reducedParams: Record<string, unknown> = {};
    for (const [key, def] of Object.entries(sketch.defaultParams)) {
      let value = def.default;
      // Reduce particle/count params for preview
      if (typeof value === "number" && (key.toLowerCase().includes("count") || key.toLowerCase().includes("particle") || key.toLowerCase().includes("star"))) {
        value = Math.min(value as number, 15);
      }
      reducedParams[key] = value;
    }

    try {
      sketch.setup(canvas, reducedParams);
    } catch {
      return;
    }

    let animFrame: number;
    const startTime = performance.now();
    const maxDuration = 3000; // Stop after 3 seconds

    const animate = () => {
      const elapsed = performance.now() - startTime;
      if (elapsed > maxDuration) {
        return; // Stop animation to save CPU
      }
      try {
        sketch.draw(ctx, elapsed, reducedParams);
      } catch {
        return;
      }
      animFrame = requestAnimationFrame(animate);
    };

    animFrame = requestAnimationFrame(animate);

    cleanupRef.current = () => {
      cancelAnimationFrame(animFrame);
      try {
        sketch.destroy();
      } catch {
        // ignore cleanup errors
      }
    };

    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [sketchName, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-md w-full h-auto"
      style={{ imageRendering: "auto" }}
    />
  );
};

export default SketchPreview;
