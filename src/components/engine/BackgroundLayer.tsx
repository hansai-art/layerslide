import { useEffect, useRef, useCallback, useState } from "react";
import type { BackgroundConfig, SketchModule } from "@/types/layerslide";
import { getSketch } from "@/sketches/registry";

interface BackgroundLayerProps {
  config: BackgroundConfig;
}

/** Single canvas element running a sketch */
function SketchCanvas({
  config,
  style,
}: {
  config: BackgroundConfig;
  style?: React.CSSProperties;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const sketchRef = useRef<SketchModule | null>(null);
  const startTimeRef = useRef<number>(performance.now());
  const configRef = useRef(config);
  configRef.current = config;

  const runSketch = useCallback((canvas: HTMLCanvasElement, sketchName: string) => {
    const sketch = getSketch(sketchName);
    if (!sketch) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    sketchRef.current?.destroy();
    cancelAnimationFrame(animFrameRef.current);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const resolvedParams: Record<string, unknown> = {};
    for (const [key, def] of Object.entries(sketch.defaultParams)) {
      resolvedParams[key] = configRef.current.params?.[key] ?? def.default;
    }

    sketch.setup(canvas, resolvedParams);
    sketchRef.current = sketch;
    startTimeRef.current = performance.now();

    const draw = () => {
      const time = performance.now() - startTimeRef.current;
      const liveParams: Record<string, unknown> = {};
      for (const [key, def] of Object.entries(sketch.defaultParams)) {
        liveParams[key] = configRef.current.params?.[key] ?? def.default;
      }
      sketch.draw(ctx, time, liveParams);
      animFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
  }, []);

  useEffect(() => {
    if (config.type === "generator" && config.sketch && canvasRef.current) {
      runSketch(canvasRef.current, config.sketch);
    }
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        sketchRef.current?.resize?.(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      sketchRef.current?.destroy();
      window.removeEventListener("resize", handleResize);
    };
  }, [config.type, config.sketch, runSketch]);

  useEffect(() => {
    if (sketchRef.current && config.params) {
      sketchRef.current.updateParams(config.params);
    }
  }, [config.params]);

  return (
    <div className="absolute inset-0" style={style}>
      {config.type === "generator" && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      )}
      {config.type === "video" && config.src && (
        <video
          src={config.src}
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {config.type === "image" && config.src && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${config.src})` }}
        />
      )}
      {config.type === "iframe" && config.src && (
        <iframe
          src={config.src}
          className="absolute inset-0 w-full h-full border-0"
          title="Background"
        />
      )}
    </div>
  );
}

/** Layer 0: Persistent background with crossfade support */
const BackgroundLayer = ({ config }: BackgroundLayerProps) => {
  const [prevConfig, setPrevConfig] = useState<BackgroundConfig | null>(null);
  const [fadeProgress, setFadeProgress] = useState(1); // 1 = fully showing current
  const prevSketchRef = useRef<string | undefined>(undefined);

  // Detect sketch change for crossfade
  useEffect(() => {
    const sketchChanged = config.sketch !== prevSketchRef.current;
    if (sketchChanged && prevSketchRef.current !== undefined) {
      // Start crossfade
      setPrevConfig({
        ...config,
        sketch: prevSketchRef.current,
      });
      setFadeProgress(0);

      const start = performance.now();
      const duration = 1000;
      const animate = () => {
        const elapsed = performance.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        setFadeProgress(progress);
        if (progress < 1) requestAnimationFrame(animate);
        else setPrevConfig(null);
      };
      requestAnimationFrame(animate);
    }
    prevSketchRef.current = config.sketch;
  }, [config.sketch]);

  const opacity = config.opacity ?? 1;
  const blur = config.blur ?? 0;

  return (
    <div
      id="ls-background"
      className="absolute inset-0"
      style={{
        zIndex: 0,
        opacity,
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
      }}
    >
      {/* Outgoing background (fading out) */}
      {prevConfig && fadeProgress < 1 && (
        <SketchCanvas
          config={prevConfig}
          style={{ opacity: 1 - fadeProgress }}
        />
      )}

      {/* Current background */}
      <SketchCanvas
        config={config}
        style={{ opacity: prevConfig ? fadeProgress : 1 }}
      />

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
