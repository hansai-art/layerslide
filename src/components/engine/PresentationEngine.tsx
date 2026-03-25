import { useState, useEffect, useCallback } from "react";
import type { BackgroundConfig, TextOverlay, SlideConfig } from "@/types/layerslide";
import BackgroundLayer from "./BackgroundLayer";
import SlideLayer from "./SlideLayer";
import OverlayLayer from "./OverlayLayer";
import ControlPanel from "./ControlPanel";

interface PresentationEngineProps {
  slides: SlideConfig[];
  background: BackgroundConfig;
  initialOverlays?: TextOverlay[];
}

/** Main engine — orchestrates all three layers + control panel */
const PresentationEngine = ({ slides, background, initialOverlays }: PresentationEngineProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);

  // Get overlays for current slide
  const activeOverlays = slides[currentSlide]?.overlays ?? initialOverlays ?? [];

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case " ":
          e.preventDefault();
          setCurrentSlide((s) => Math.min(s + 1, slides.length - 1));
          break;
        case "ArrowLeft":
          e.preventDefault();
          setCurrentSlide((s) => Math.max(s - 1, 0));
          break;
        case "F9":
          e.preventDefault();
          setPanelOpen((p) => !p);
          break;
        case "t":
        case "T":
          // Toggle overlays visibility could go here
          break;
      }
    },
    [slides.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-ls-surface-0">
      {/* Layer 0 — Persistent Background */}
      <BackgroundLayer config={background} />

      {/* Layer 1 — Slides (transparent) */}
      <SlideLayer
        slides={slides}
        currentSlide={currentSlide}
        onSlideChange={setCurrentSlide}
      />

      {/* Layer 2 — Text Overlay */}
      <OverlayLayer overlays={activeOverlays} />

      {/* Control Layer — Side Panel */}
      <ControlPanel
        isOpen={panelOpen}
        onToggle={() => setPanelOpen(!panelOpen)}
        background={background}
        overlays={activeOverlays}
        currentSlide={currentSlide}
        totalSlides={slides.length}
      />
    </div>
  );
};

export default PresentationEngine;
