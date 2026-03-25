import type { SlideConfig, TransitionType } from "@/types/layerslide";
import { getTransitionStyle } from "./slide-transition";

interface SlideLayerProps {
  slides: SlideConfig[];
  currentSlide: number;
  onSlideChange: (index: number) => void;
  transition?: TransitionType;
}

/** Layer 1: Slide content with transition effects */
const SlideLayer = ({ slides, currentSlide, onSlideChange, transition = "fade" }: SlideLayerProps) => {
  const goNext = () => onSlideChange(Math.min(currentSlide + 1, slides.length - 1));
  const goPrev = () => onSlideChange(Math.max(currentSlide - 1, 0));

  return (
    <div
      id="ls-slides"
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 1, paddingBottom: 124 }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="flex items-center justify-center"
            style={getTransitionStyle(index === currentSlide, transition)}
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
