import { useRef, useEffect, useCallback } from "react";
import { Plus, Copy, Trash2, Undo2, Redo2, MonitorPlay } from "lucide-react";
import { useEngine } from "@/hooks/use-engine";
import { useI18n } from "@/i18n/i18n-context";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  destructive = false,
}: {
  icon: typeof Plus;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          disabled={disabled}
          className={cn(
            "inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors",
            "text-muted-foreground hover:text-foreground hover:bg-ls-surface-2",
            "disabled:opacity-40 disabled:pointer-events-none",
            destructive && "hover:text-destructive hover:bg-destructive/10"
          )}
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

interface SlideFilmstripProps {
  onOpenPresenter: () => void;
}

/** Bottom filmstrip bar showing slide thumbnails */
const SlideFilmstrip = ({ onOpenPresenter }: SlideFilmstripProps) => {
  const { state, dispatch } = useEngine();
  const { t } = useI18n();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { currentSlide, slides } = state;

  const scrollToActive = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const thumb = container.children[currentSlide] as HTMLElement | undefined;
    if (!thumb) return;
    const left = thumb.offsetLeft - container.offsetWidth / 2 + thumb.offsetWidth / 2;
    container.scrollTo({ left, behavior: "smooth" });
  }, [currentSlide]);

  useEffect(() => {
    scrollToActive();
  }, [scrollToActive]);

  const getPreview = (slideIndex: number): string => {
    const slide = slides[slideIndex];
    if (!slide) return "";
    const first = slide.overlays.find((o) => o.visible);
    if (!first) return slide.content ? "HTML" : "";
    const plain = first.text.replace(/<[^>]+>/g, "");
    return plain.length > 24 ? plain.slice(0, 22) + "..." : plain;
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className="fixed bottom-0 left-0 right-0 bg-ls-surface-0/90 backdrop-blur-md border-t border-border"
        style={{ zIndex: 5 }}
        data-tour="filmstrip"
      >
        {/* Toolbar row */}
        <div className="flex items-center justify-between h-9 px-3 border-b border-border/50">
          <span className="text-[11px] font-mono text-ls-text-dim select-none">
            {t("filmstrip.slides")} {currentSlide + 1}/{slides.length}
          </span>

          <div className="flex items-center gap-0.5">
            <ToolbarButton
              icon={Plus}
              label={t("filmstrip.addSlide")}
              onClick={() => dispatch({ type: "ADD_SLIDE" })}
            />
            <ToolbarButton
              icon={Copy}
              label={t("filmstrip.duplicateSlide")}
              onClick={() => dispatch({ type: "DUPLICATE_SLIDE", index: currentSlide })}
            />
            <ToolbarButton
              icon={Trash2}
              label={t("filmstrip.deleteSlide")}
              onClick={() => dispatch({ type: "DELETE_SLIDE", index: currentSlide })}
              disabled={slides.length <= 1}
              destructive
            />

            <div className="w-px h-4 mx-1.5 bg-border" />

            <ToolbarButton
              icon={Undo2}
              label={`${t("filmstrip.undo")} (Ctrl+Z)`}
              onClick={() => dispatch({ type: "UNDO" })}
              disabled={state.history.length === 0}
            />
            <ToolbarButton
              icon={Redo2}
              label={`${t("filmstrip.redo")} (Ctrl+Y)`}
              onClick={() => dispatch({ type: "REDO" })}
              disabled={state.future.length === 0}
            />

            <div className="w-px h-4 mx-1.5 bg-border" />

            <ToolbarButton
              icon={MonitorPlay}
              label={`${t("filmstrip.presenter")} (F5)`}
              onClick={onOpenPresenter}
            />
          </div>
        </div>

        {/* Thumbnails row */}
        <div
          ref={scrollRef}
          className="flex items-center gap-2.5 px-3 py-2.5 overflow-x-auto"
          style={{ height: 88 }}
        >
          {slides.map((slide, index) => {
            const isActive = index === currentSlide;
            return (
              <button
                key={slide.id}
                onClick={() => dispatch({ type: "SET_SLIDE", index })}
                className={cn(
                  "relative flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200",
                  "bg-ls-surface-1 border-2",
                  isActive
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-transparent hover:border-primary/40"
                )}
                style={{ width: 120, height: 68 }}
              >
                <span
                  className={cn(
                    "absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold leading-none",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-ls-surface-2 text-ls-text-dim"
                  )}
                >
                  {index + 1}
                </span>
                <div className="absolute inset-0 flex items-center justify-center px-2 pt-4">
                  <span className="text-[10px] text-muted-foreground text-center leading-tight line-clamp-2 select-none">
                    {getPreview(index)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default SlideFilmstrip;
