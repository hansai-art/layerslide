import { useEffect, useRef, useState } from "react";
import { getSketch } from "@/sketches/registry";

interface SketchPreviewProps {
  sketchName: string;
  width?: number;
  height?: number;
}

// Cache snapshots so we don't re-render when component remounts
const snapshotCache = new Map<string, string>();

/** Renders a static snapshot of a sketch (runs ~30 frames then captures) */
const SketchPreview = ({ sketchName, width = 120, height = 68 }: SketchPreviewProps) => {
  const [snapshot, setSnapshot] = useState<string | null>(
    snapshotCache.get(sketchName) ?? null
  );

  useEffect(() => {
    // Already cached
    if (snapshotCache.has(sketchName)) {
      setSnapshot(snapshotCache.get(sketchName)!);
      return;
    }

    const sketch = getSketch(sketchName);
    if (!sketch) return;

    // Create offscreen canvas
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reduced params for preview
    const params: Record<string, unknown> = {};
    for (const [key, def] of Object.entries(sketch.defaultParams)) {
      let value = def.default;
      if (
        typeof value === "number" &&
        (key.toLowerCase().includes("count") ||
          key.toLowerCase().includes("particle") ||
          key.toLowerCase().includes("star") ||
          key.toLowerCase().includes("blob"))
      ) {
        value = Math.min(value as number, 10);
      }
      params[key] = value;
    }

    try {
      sketch.setup(canvas, params);
    } catch {
      return;
    }

    // Run 30 frames then capture
    let frame = 0;
    const maxFrames = 30;
    let raf: number;

    const run = () => {
      try {
        sketch.draw(ctx, frame * 50, params); // simulate 50ms per frame
      } catch {
        sketch.destroy();
        return;
      }
      frame++;
      if (frame < maxFrames) {
        raf = requestAnimationFrame(run);
      } else {
        // Capture snapshot
        const dataUrl = canvas.toDataURL("image/png");
        snapshotCache.set(sketchName, dataUrl);
        setSnapshot(dataUrl);
        sketch.destroy();
      }
    };

    raf = requestAnimationFrame(run);

    return () => {
      cancelAnimationFrame(raf);
      try { sketch.destroy(); } catch { /* ignore */ }
    };
  }, [sketchName, width, height]);

  if (snapshot) {
    return (
      <img
        src={snapshot}
        alt={sketchName}
        className="rounded-md w-full h-auto"
        width={width}
        height={height}
      />
    );
  }

  // Loading placeholder
  return (
    <div
      className="rounded-md w-full bg-ls-surface-3 flex items-center justify-center"
      style={{ height, aspectRatio: `${width}/${height}` }}
    >
      <span className="text-[9px] text-ls-text-dim animate-pulse">載入中...</span>
    </div>
  );
};

export default SketchPreview;
