import { useEffect, useCallback, useRef, useState } from "react";
import type { BackgroundConfig, SlideConfig } from "@/types/layerslide";
import { EngineProvider } from "./state/engine-context";
import { useEngine } from "@/hooks/use-engine";
import { useFpsMonitor } from "@/hooks/use-fps-monitor";
import { useVisibilityPause } from "@/hooks/use-visibility-pause";
import { useAutoSave } from "@/hooks/use-auto-save";
import BackgroundLayer from "./BackgroundLayer";
import SlideLayer from "./SlideLayer";
import OverlayLayer from "./OverlayLayer";
import ControlPanel from "./ControlPanel";
import SlideFilmstrip from "./slide-filmstrip";
import PresenterMode from "./presenter-mode";
import FloatingToolbar from "./floating-toolbar";
import OnboardingTutorial from "./onboarding-tutorial";

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

  // Auto-save to localStorage
  useAutoSave(state);

  // Presenter mode
  const [presenterOpen, setPresenterOpen] = useState(false);

  // Floating toolbar state
  const [selectedOverlay, setSelectedOverlay] = useState<{
    overlayId: string;
    position: { x: number; y: number };
  } | null>(null);

  const editMode = panelOpen;

  const handleSelectOverlay = useCallback(
    (overlayId: string, rect: DOMRect) => {
      setSelectedOverlay({
        overlayId,
        position: { x: rect.left + rect.width / 2, y: rect.top },
      });
    },
    []
  );

  // Close floating toolbar on slide/panel change
  useEffect(() => {
    setSelectedOverlay(null);
  }, [currentSlide, panelOpen]);

  const selectedOverlayData = selectedOverlay
    ? activeOverlays.find((o) => o.id === selectedOverlay.overlayId)
    : null;

  // FPS monitoring with auto-degrade
  const handleFpsUpdate = useCallback(
    (fps: number) => {
      dispatch({ type: "SET_FPS", fps });
      if (!autoDegrade) return;
      if (fps < 30) {
        lowFpsCountRef.current++;
        if (lowFpsCountRef.current >= 3 && !degradedRef.current) {
          degradedRef.current = true;
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

  useVisibilityPause(
    useCallback(() => dispatch({ type: "SET_PRESENTING", presenting: false }), [dispatch]),
    useCallback(() => dispatch({ type: "SET_PRESENTING", presenting: true }), [dispatch])
  );

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      // Ctrl+Z / Cmd+Z = Undo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: "UNDO" });
        return;
      }
      // Ctrl+Y / Cmd+Shift+Z = Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        dispatch({ type: "REDO" });
        return;
      }

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
        case "p":
        case "P":
          e.preventDefault();
          dispatch({ type: "TOGGLE_PANEL" });
          break;
        case "F5":
          e.preventDefault();
          setPresenterOpen(true);
          break;
        case "Escape":
          if (presenterOpen) {
            e.preventDefault();
            setPresenterOpen(false);
          }
          break;
      }
    },
    [dispatch, presenterOpen]
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
      <OverlayLayer
        overlays={activeOverlays}
        editMode={editMode}
        onSelectOverlay={handleSelectOverlay}
      />
      {selectedOverlayData && selectedOverlay && (
        <FloatingToolbar
          overlay={selectedOverlayData}
          slideIndex={currentSlide}
          position={selectedOverlay.position}
          onClose={() => setSelectedOverlay(null)}
        />
      )}
      <ControlPanel
        isOpen={panelOpen}
        onToggle={() => dispatch({ type: "TOGGLE_PANEL" })}
      />
      <SlideFilmstrip onOpenPresenter={() => setPresenterOpen(true)} />
      <PresenterMode
        isOpen={presenterOpen}
        onClose={() => setPresenterOpen(false)}
      />
      <OnboardingTutorial />
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
