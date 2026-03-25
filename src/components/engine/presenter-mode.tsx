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

const stripHtml = (html: string) => html.replace(/<[^>]+>/g, "");

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
      className="fixed bottom-[124px] left-0 right-0 z-[15]"
      style={{ pointerEvents: "none" }}
    >
      {/* Presenter bar: semi-transparent, sits above filmstrip, below control panel */}
      <div
        className={cn(
          "mx-4 rounded-xl border border-border",
          "bg-ls-surface-0/85 backdrop-blur-xl shadow-2xl shadow-black/40",
          "flex items-stretch gap-0 overflow-hidden"
        )}
        style={{ pointerEvents: "auto" }}
      >
        {/* Timer */}
        <div className="flex items-center gap-2 px-5 py-3 border-r border-border/50">
          <span className="text-2xl font-mono tabular-nums text-foreground font-semibold">
            {formatTime(elapsed)}
          </span>
          <button
            onClick={() => (running ? pauseTimer() : startTimer())}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              "hover:bg-ls-surface-2 text-muted-foreground hover:text-foreground"
            )}
            title={running ? "暫停" : "開始"}
          >
            {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={resetTimer}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              "hover:bg-ls-surface-2 text-muted-foreground hover:text-foreground"
            )}
            title="重置"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Slide counter */}
        <div className="flex items-center gap-1.5 px-4 border-r border-border/50">
          <span className="text-xl font-bold tabular-nums text-primary">
            {currentSlide + 1}
          </span>
          <span className="text-sm font-mono text-ls-text-dim">
            / {totalSlides}
          </span>
        </div>

        {/* Speaker notes */}
        <div className="flex-1 min-w-0 px-4 py-2.5 border-r border-border/50 overflow-y-auto max-h-[100px]">
          <p className="text-[9px] font-mono uppercase tracking-widest text-ls-text-dim mb-0.5">
            講者筆記
          </p>
          {notes ? (
            <p className="text-xs leading-relaxed text-foreground/80 whitespace-pre-wrap">
              {notes}
            </p>
          ) : (
            <p className="text-xs text-ls-text-dim italic">（無筆記）</p>
          )}
        </div>

        {/* Next slide preview */}
        <div className="flex items-center px-4 border-r border-border/50 max-w-[200px]">
          <div className="min-w-0">
            <p className="text-[9px] font-mono uppercase tracking-widest text-ls-text-dim mb-0.5">
              下一張
            </p>
            {nextSlide ? (
              <p className="text-xs text-foreground/60 truncate">
                {nextOverlayText || "（無文字）"}
              </p>
            ) : (
              <p className="text-xs text-ls-text-dim italic">最後一張</p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 px-3">
          <button
            onClick={() => dispatch({ type: "PREV_SLIDE" })}
            disabled={currentSlide === 0}
            className={cn(
              "p-2 rounded-md transition-colors",
              "hover:bg-ls-surface-2 text-muted-foreground hover:text-foreground",
              "disabled:opacity-30 disabled:pointer-events-none"
            )}
            title="上一張"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => dispatch({ type: "NEXT_SLIDE" })}
            disabled={currentSlide === totalSlides - 1}
            className={cn(
              "p-2 rounded-md transition-colors",
              "hover:bg-ls-surface-2 text-muted-foreground hover:text-foreground",
              "disabled:opacity-30 disabled:pointer-events-none"
            )}
            title="下一張"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-border/50 mx-0.5" />

          <button
            onClick={toggleFullscreen}
            className={cn(
              "p-2 rounded-md transition-colors",
              "hover:bg-ls-surface-2 text-muted-foreground hover:text-foreground"
            )}
            title={isFullscreen ? "退出全螢幕" : "全螢幕"}
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={onClose}
            className={cn(
              "p-2 rounded-md transition-colors",
              "bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300"
            )}
            title="結束簡報 (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PresenterMode;
