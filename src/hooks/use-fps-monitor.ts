import { useEffect, useRef } from "react";

interface FpsMonitorOptions {
  onFpsUpdate: (fps: number) => void;
  sampleInterval?: number; // ms between FPS reports (default: 1000)
}

/** Monitors frame rate and calls back with current FPS */
export function useFpsMonitor({ onFpsUpdate, sampleInterval = 1000 }: FpsMonitorOptions) {
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const tick = () => {
      frameCountRef.current++;
      const now = performance.now();
      const elapsed = now - lastTimeRef.current;

      if (elapsed >= sampleInterval) {
        const fps = Math.round((frameCountRef.current * 1000) / elapsed);
        onFpsUpdate(fps);
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [onFpsUpdate, sampleInterval]);
}
