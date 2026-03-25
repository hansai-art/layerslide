import { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize,
  Minimize,
} from "lucide-react";
import { useEngine } from "@/hooks/use-engine";
import { useFullscreen } from "@/hooks/use-fullscreen";
import { cn } from "@/lib/utils";

interface PresenterModeProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

const PresenterMode = ({ isOpen, onClose }: PresenterModeProps) => {
  const { state, dispatch } = useEngine();
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentSlide = state.currentSlide;
  const totalSlides = state.slides.length;
  const slide = state.slides[currentSlide];
  const nextSlide = state.slides[currentSlide + 1] ?? null;
  const notes = slide?.notes ?? "";

  // Strip HTML tags for text preview
  const stripHtml = (html: string) => html.replace(/<[^>]+>/g, "");

  const currentOverlayText = slide?.overlays
    .filter((o) => o.visible)
    .map((o) => stripHtml(o.text))
    .join(" / ") || "";

  const nextOverlayText = nextSlide?.overlays
    .filter((o) => o.visible)
    .map((o) => stripHtml(o.text))
    .join(" / ") || "";

  // Timer logic
  const startTimer = useCallback(() => {
    if (intervalRef.current) return;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  }, []);

  const pauseTimer = useCallback(() => {
    setRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    pauseTimer();
    setElapsed(0);
  }, [pauseTimer]);

  // Auto-start timer when opening
  useEffect(() => {
    if (isOpen) {
      setElapsed(0);
      startTimer();
    } else {
      pauseTimer();
      setElapsed(0);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        case "ArrowLeft":
          e.preventDefault();
          dispatch({ type: "PREV_SLIDE" });
          break;
        case "ArrowRight":
        case " ":
          e.preventDefault();
          dispatch({ type: "NEXT_SLIDE" });
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose, dispatch]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-20",
        "bg-ls-surface-0/95 backdrop-blur-lg",
        "flex flex-col text-foreground"
      )}
    >
      {/* === Top section (80%) : slide info === */}
      <div className="flex-[4] flex items-center justify-center gap-12 px-12">
        {/* Current slide number */}
        <div className="flex items-baseline gap-2 select-none">
          <span className="text-8xl font-bold tabular-nums text-primary">
            {currentSlide + 1}
          </span>
          <span className="text-3xl font-mono text-ls-text-dim">
            / {totalSlides}
          </span>
        </div>

        {/* Current slide overlay preview */}
        <div className="flex-1 max-w-xl space-y-4">
          <p className="text-xs font-mono uppercase tracking-widest text-ls-text-dim">
            目前投影片
          </p>
          <p className="text-xl leading-relaxed text-foreground/90 line-clamp-4">
            {currentOverlayText || "（無文字覆蓋）"}
          </p>
        </div>

        {/* Next slide preview */}
        <div className="flex-1 max-w-sm space-y-4">
          <p className="text-xs font-mono uppercase tracking-widest text-ls-text-dim">
            下一張
          </p>
          {nextSlide ? (
            <p className="text-lg leading-relaxed text-foreground/60 line-clamp-3">
              {nextOverlayText || "（無文字覆蓋）"}
            </p>
          ) : (
            <p className="text-lg text-ls-text-dim italic">最後一張</p>
          )}
        </div>
      </div>

      {/* === Bottom section (20%) : presenter tools bar === */}
      <div className="flex-1 border-t border-border bg-ls-surface-0/60 flex items-center px-8 gap-8">
        {/* Left: Timer */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-4xl font-mono tabular-nums text-foreground">
            {formatTime(elapsed)}
          </span>
          <button
            onClick={() => (running ? pauseTimer() : startTimer())}
            className={cn(
              "p-2 rounded-lg transition-colors",
              "bg-ls-surface-1 hover:bg-ls-surface-2 text-muted-foreground hover:text-foreground"
            )}
            title={running ? "暫停" : "開始"}
          >
            {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={resetTimer}
            className={cn(
              "p-2 rounded-lg transition-colors",
              "bg-ls-surface-1 hover:bg-ls-surface-2 text-muted-foreground hover:text-foreground"
            )}
            title="重置"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Speaker notes */}
        <div className="flex-1 min-w-0 overflow-y-auto max-h-full py-2">
          <p className="text-[10px] font-mono uppercase tracking-widest text-ls-text-dim mb-1">
            講者筆記
          </p>
          {notes ? (
            <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
              {notes}
            </p>
          ) : (
            <p className="text-sm text-ls-text-dim italic">
              （此投影片沒有筆記）
            </p>
          )}
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => dispatch({ type: "PREV_SLIDE" })}
            disabled={currentSlide === 0}
            className={cn(
              "p-2.5 rounded-lg transition-colors",
              "bg-ls-surface-1 hover:bg-ls-surface-2 text-muted-foreground hover:text-foreground",
              "disabled:opacity-30 disabled:pointer-events-none"
            )}
            title="上一張"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => dispatch({ type: "NEXT_SLIDE" })}
            disabled={currentSlide === totalSlides - 1}
            className={cn(
              "p-2.5 rounded-lg transition-colors",
              "bg-ls-surface-1 hover:bg-ls-surface-2 text-muted-foreground hover:text-foreground",
              "disabled:opacity-30 disabled:pointer-events-none"
            )}
            title="下一張"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-border mx-1" />

          <button
            onClick={toggleFullscreen}
            className={cn(
              "p-2.5 rounded-lg transition-colors",
              "bg-ls-surface-1 hover:bg-ls-surface-2 text-muted-foreground hover:text-foreground"
            )}
            title={isFullscreen ? "退出全螢幕" : "全螢幕"}
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={onClose}
            className={cn(
              "p-2.5 rounded-lg transition-colors",
              "bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300"
            )}
            title="結束簡報"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PresenterMode;
