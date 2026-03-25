import type { SlideConfig } from "@/types/layerslide";

interface SlideLayerProps {
  slides: SlideConfig[];
  currentSlide: number;
  onSlideChange: (index: number) => void;
}

/** Layer 1 — Slide content (transparent background, sits between bg and overlay) */
const SlideLayer = ({ slides, currentSlide, onSlideChange }: SlideLayerProps) => {
  const goNext = () => onSlideChange(Math.min(currentSlide + 1, slides.length - 1));
  const goPrev = () => onSlideChange(Math.max(currentSlide - 1, 0));

  return (
    <div
      id="ls-slides"
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 1 }}
    >
      {/* Slide content area */}
      <div className="relative w-full h-full flex items-center justify-center">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
            style={{
              opacity: index === currentSlide ? 1 : 0,
              pointerEvents: index === currentSlide ? "auto" : "none",
            }}
          >
            {slide.content && (
              <div
                className="max-w-5xl px-12 text-foreground"
                dangerouslySetInnerHTML={{ __html: slide.content }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Minimal navigation hints */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => onSlideChange(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === currentSlide
                ? "bg-primary w-6"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
            }`}
          />
        ))}
      </div>

      {/* Invisible click areas for nav */}
      <button
        onClick={goPrev}
        className="absolute left-0 top-0 w-1/4 h-full cursor-w-resize opacity-0"
        aria-label="Previous slide"
      />
      <button
        onClick={goNext}
        className="absolute right-0 top-0 w-1/4 h-full cursor-e-resize opacity-0"
        aria-label="Next slide"
      />
    </div>
  );
};

export default SlideLayer;
