import { useEffect, useCallback, useRef } from "react";
import type { BackgroundConfig, SlideConfig } from "@/types/layerslide";
import { EngineProvider } from "./state/engine-context";
import { useEngine } from "@/hooks/use-engine";
import { useFpsMonitor } from "@/hooks/use-fps-monitor";
import { useVisibilityPause } from "@/hooks/use-visibility-pause";
import BackgroundLayer from "./BackgroundLayer";
import SlideLayer from "./SlideLayer";
import OverlayLayer from "./OverlayLayer";
import ControlPanel from "./ControlPanel";

interface PresentationEngineProps {
  slides: SlideConfig[];
  background: BackgroundConfig;
}

/** Inner component that consumes engine context */
const EngineInner = () => {
  const { state, dispatch } = useEngine();
  const { currentSlide, slides, background, panelOpen, autoDegrade } = state;
  const lowFpsCountRef = useRef(0);
  const degradedRef = useRef(false);

  const activeOverlays = slides[currentSlide]?.overlays ?? [];

  // FPS monitoring with auto-degrade
  const handleFpsUpdate = useCallback(
    (fps: number) => {
      dispatch({ type: "SET_FPS", fps });

      if (!autoDegrade) return;

      if (fps < 30) {
        lowFpsCountRef.current++;
        // Degrade after 3 consecutive low FPS readings
        if (lowFpsCountRef.current >= 3 && !degradedRef.current) {
          degradedRef.current = true;
          // Reduce particle count by half
          const currentCount = (state.background.params?.particleCount as number) ?? 80;
          if (currentCount > 20) {
            dispatch({
              type: "UPDATE_BACKGROUND_PARAM",
              key: "particleCount",
              value: Math.max(20, Math.round(currentCount / 2)),
            });
          }
        }
      } else {
        lowFpsCountRef.current = 0;
      }
    },
    [dispatch, autoDegrade, state.background.params?.particleCount]
  );

  useFpsMonitor({ onFpsUpdate: handleFpsUpdate });

  // Pause animations when tab is hidden
  useVisibilityPause(
    useCallback(() => dispatch({ type: "SET_PRESENTING", presenting: false }), [dispatch]),
    useCallback(() => dispatch({ type: "SET_PRESENTING", presenting: true }), [dispatch])
  );

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case " ":
          e.preventDefault();
          dispatch({ type: "NEXT_SLIDE" });
          break;
        case "ArrowLeft":
          e.preventDefault();
          dispatch({ type: "PREV_SLIDE" });
          break;
        case "F9":
          e.preventDefault();
          dispatch({ type: "TOGGLE_PANEL" });
          break;
      }
    },
    [dispatch]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-ls-surface-0">
      <BackgroundLayer config={background} />
      <SlideLayer
        slides={slides}
        currentSlide={currentSlide}
        onSlideChange={(i) => dispatch({ type: "SET_SLIDE", index: i })}
      />
      <OverlayLayer overlays={activeOverlays} />
      <ControlPanel
        isOpen={panelOpen}
        onToggle={() => dispatch({ type: "TOGGLE_PANEL" })}
      />
    </div>
  );
};

/** Main engine: wraps everything in EngineProvider */
const PresentationEngine = ({ slides, background }: PresentationEngineProps) => {
  return (
    <EngineProvider slides={slides} background={background}>
      <EngineInner />
    </EngineProvider>
  );
};

export default PresentationEngine;
