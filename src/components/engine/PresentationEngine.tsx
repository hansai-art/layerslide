import { useEffect, useCallback, useRef, useState, useMemo } from "react";
import type { BackgroundConfig, SlideConfig, TransitionType } from "@/types/layerslide";
import { EngineProvider } from "./state/engine-context";
import { useEngine } from "@/hooks/use-engine";
import { useFpsMonitor } from "@/hooks/use-fps-monitor";
import { useVisibilityPause } from "@/hooks/use-visibility-pause";
import { useTouchNavigation } from "@/hooks/use-touch-navigation";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useKeyboardShortcuts, type ShortcutDef } from "@/hooks/use-keyboard-shortcuts";
import { useFullscreen } from "@/hooks/use-fullscreen";
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
  transition?: TransitionType;
}

/** Inner component that consumes engine context */
const EngineInner = () => {
  const { state, dispatch } = useEngine();
  const { currentSlide, slides, background, panelOpen, autoDegrade, transition } = state;
  const lowFpsCountRef = useRef(0);
  const degradedRef = useRef(false);

  const { isFullscreen } = useFullscreen();

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

  useTouchNavigation({
    onSwipeLeft: () => dispatch({ type: "NEXT_SLIDE" }),
    onSwipeRight: () => dispatch({ type: "PREV_SLIDE" }),
  });

  // Keyboard shortcuts
  const shortcuts = useMemo<ShortcutDef[]>(
    () => [
      { key: "z", ctrl: true, label: "復原", action: () => dispatch({ type: "UNDO" }) },
      { key: "y", ctrl: true, label: "重做", action: () => dispatch({ type: "REDO" }) },
      { key: "z", ctrl: true, shift: true, label: "重做", action: () => dispatch({ type: "REDO" }) },
      { key: "ArrowRight", label: "下一張投影片", action: () => dispatch({ type: "NEXT_SLIDE" }) },
      { key: " ", label: "下一張投影片", action: () => dispatch({ type: "NEXT_SLIDE" }) },
      { key: "ArrowLeft", label: "上一張投影片", action: () => dispatch({ type: "PREV_SLIDE" }) },
      { key: "p", label: "切換控制面板", action: () => dispatch({ type: "TOGGLE_PANEL" }) },
      { key: "P", label: "切換控制面板", action: () => dispatch({ type: "TOGGLE_PANEL" }) },
      { key: "F5", label: "簡報者模式", action: () => setPresenterOpen(true) },
      {
        key: "Escape",
        label: "關閉簡報者模式",
        action: () => { if (presenterOpen) setPresenterOpen(false); },
      },
      {
        key: "s",
        ctrl: true,
        label: "手動儲存",
        action: () => console.log("[LayerSlide] Manual save triggered"),
      },
      {
        key: "Delete",
        label: "刪除選取的覆蓋層",
        action: () => {
          if (selectedOverlay) {
            dispatch({ type: "REMOVE_OVERLAY", slideIndex: currentSlide, overlayId: selectedOverlay.overlayId });
            setSelectedOverlay(null);
          }
        },
      },
      {
        key: "Backspace",
        label: "刪除選取的覆蓋層",
        action: () => {
          if (selectedOverlay) {
            dispatch({ type: "REMOVE_OVERLAY", slideIndex: currentSlide, overlayId: selectedOverlay.overlayId });
            setSelectedOverlay(null);
          }
        },
      },
    ],
    [dispatch, presenterOpen, selectedOverlay, currentSlide]
  );

  useKeyboardShortcuts(shortcuts);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-ls-surface-0" id="ls-engine">
      <BackgroundLayer config={slides[currentSlide]?.background ?? background} />
      <SlideLayer
        slides={slides}
        currentSlide={currentSlide}
        onSlideChange={(i) => dispatch({ type: "SET_SLIDE", index: i })}
        transition={transition}
        fullscreen={isFullscreen}
      />
      <OverlayLayer
        overlays={activeOverlays}
        editMode={editMode}
        onSelectOverlay={handleSelectOverlay}
      />
      {/* UI elements: hidden via CSS in fullscreen to avoid unmounting */}
      <div style={{ display: isFullscreen ? "none" : "contents" }}>
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
    </div>
  );
};

/** Main engine: wraps everything in EngineProvider */
const PresentationEngine = ({ slides, background, transition }: PresentationEngineProps) => {
  return (
    <EngineProvider slides={slides} background={background} transition={transition}>
      <EngineInner />
    </EngineProvider>
  );
};

export default PresentationEngine;
