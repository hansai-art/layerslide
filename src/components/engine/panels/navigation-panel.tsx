import { useEngine } from "@/hooks/use-engine";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-mono uppercase tracking-widest text-ls-text-dim">{children}</p>
  );
}

/** Slide navigation panel with speaker notes */
const NavigationPanel = () => {
  const { state, dispatch } = useEngine();
  const { currentSlide, slides } = state;
  const currentNotes = slides[currentSlide]?.notes ?? "";

  return (
    <div className="space-y-4">
      <SectionLabel>投影片導航</SectionLabel>

      {/* Prev/Next buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => dispatch({ type: "PREV_SLIDE" })}
          disabled={currentSlide === 0}
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-md text-xs",
            "bg-ls-surface-2 border border-border transition-colors",
            currentSlide === 0
              ? "opacity-40 cursor-not-allowed"
              : "hover:border-primary/40 hover:text-foreground text-muted-foreground"
          )}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          上一張
        </button>
        <span className="text-xs font-mono text-foreground">
          {currentSlide + 1} / {slides.length}
        </span>
        <button
          onClick={() => dispatch({ type: "NEXT_SLIDE" })}
          disabled={currentSlide === slides.length - 1}
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-md text-xs",
            "bg-ls-surface-2 border border-border transition-colors",
            currentSlide === slides.length - 1
              ? "opacity-40 cursor-not-allowed"
              : "hover:border-primary/40 hover:text-foreground text-muted-foreground"
          )}
        >
          下一張
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Slide list */}
      <div className="space-y-2">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            onClick={() => dispatch({ type: "SET_SLIDE", index: i })}
            className={cn(
              "w-full text-left rounded-lg bg-ls-surface-2 border border-border p-3 text-[11px] transition-colors",
              i === currentSlide
                ? "border-primary ring-1 ring-primary/20"
                : "hover:border-primary/30"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded bg-ls-surface-3 flex items-center justify-center text-[10px] font-mono text-muted-foreground">
                {i + 1}
              </span>
              <span className="text-foreground font-medium truncate">
                {slide.overlays[0]?.text.replace(/<[^>]+>/g, "").slice(0, 40) || "（無文字）"}
              </span>
            </div>
            {slide.notes && (
              <p className="text-[10px] text-ls-text-dim mt-1 ml-7 truncate">
                📝 {slide.notes.slice(0, 30)}
              </p>
            )}
          </button>
        ))}
      </div>

      {/* Speaker notes */}
      <SectionLabel>講者筆記</SectionLabel>
      <Textarea
        value={currentNotes}
        onChange={(e) =>
          dispatch({
            type: "UPDATE_SLIDE_NOTES",
            slideIndex: currentSlide,
            notes: e.target.value,
          })
        }
        placeholder="在此輸入講者筆記，簡報者模式 (F5) 會顯示..."
        className="text-xs bg-ls-surface-2 border-border min-h-[80px] resize-none"
      />

      {/* Keyboard shortcuts info */}
      <SectionLabel>快捷鍵</SectionLabel>
      <div className="rounded-lg bg-ls-surface-2 p-3 space-y-1.5 text-[11px]">
        <div className="flex justify-between">
          <span className="text-muted-foreground">下一張</span>
          <span className="font-mono text-foreground">→ / Space</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">上一張</span>
          <span className="font-mono text-foreground">←</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">控制面板</span>
          <span className="font-mono text-foreground">P</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">簡報者模式</span>
          <span className="font-mono text-foreground">F5</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">復原</span>
          <span className="font-mono text-foreground">Ctrl+Z</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">重做</span>
          <span className="font-mono text-foreground">Ctrl+Y</span>
        </div>
      </div>
    </div>
  );
};

export default NavigationPanel;
