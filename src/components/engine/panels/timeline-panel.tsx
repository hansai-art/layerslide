import { useEngine } from "@/hooks/use-engine";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { OverlayAnimation } from "@/types/layerslide";
import { cn } from "@/lib/utils";
import { Clock, Zap } from "lucide-react";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-mono uppercase tracking-widest text-ls-text-dim">{children}</p>
  );
}

const animationOptions: { value: OverlayAnimation; label: string }[] = [
  { value: "fadeIn", label: "淡入" },
  { value: "slideUp", label: "上滑" },
  { value: "typewriter", label: "打字機" },
  { value: "none", label: "無" },
];

/** Visual timeline for overlay animations */
const TimelinePanel = () => {
  const { state, dispatch } = useEngine();
  const { currentSlide, slides } = state;
  const overlays = slides[currentSlide]?.overlays ?? [];
  const visibleOverlays = overlays.filter((o) => o.visible);

  // Find max timeline end for scale
  const maxTime = Math.max(
    3000,
    ...visibleOverlays.map((o) => (o.delay ?? 0) + (o.duration ?? 500))
  );

  const stripHtml = (html: string) => html.replace(/<[^>]+>/g, "");

  return (
    <div className="space-y-4">
      <SectionLabel>動畫時間軸</SectionLabel>

      {visibleOverlays.length === 0 ? (
        <p className="text-xs text-ls-text-dim text-center py-4">
          此投影片沒有可見的覆蓋層。
        </p>
      ) : (
        <>
          {/* Visual timeline */}
          <div className="rounded-lg bg-ls-surface-2 p-3 space-y-2">
            {/* Time ruler */}
            <div className="flex items-center justify-between text-[9px] font-mono text-ls-text-dim px-1">
              <span>0s</span>
              <span>{(maxTime / 2000).toFixed(1)}s</span>
              <span>{(maxTime / 1000).toFixed(1)}s</span>
            </div>
            <div className="relative h-px bg-border mb-1">
              {[0, 25, 50, 75, 100].map((pct) => (
                <div
                  key={pct}
                  className="absolute top-0 w-px h-2 bg-border/60 -translate-y-1/2"
                  style={{ left: `${pct}%` }}
                />
              ))}
            </div>

            {/* Overlay bars */}
            {visibleOverlays.map((overlay, idx) => {
              const delay = overlay.delay ?? 0;
              const duration = overlay.duration ?? 500;
              const startPct = (delay / maxTime) * 100;
              const widthPct = (duration / maxTime) * 100;
              const isImage = overlay.type === "image";

              const colors = [
                "bg-primary/60",
                "bg-purple-500/60",
                "bg-yellow-500/60",
                "bg-green-500/60",
                "bg-red-500/60",
                "bg-blue-500/60",
              ];

              return (
                <div key={overlay.id} className="flex items-center gap-2 h-7">
                  {/* Label */}
                  <span className="text-[9px] text-muted-foreground w-16 truncate flex-shrink-0">
                    {isImage ? "IMG" : stripHtml(overlay.text).slice(0, 8)}
                  </span>
                  {/* Bar track */}
                  <div className="flex-1 relative h-5 rounded bg-ls-surface-1">
                    <div
                      className={cn(
                        "absolute top-0.5 bottom-0.5 rounded-sm transition-all duration-200",
                        colors[idx % colors.length]
                      )}
                      style={{
                        left: `${startPct}%`,
                        width: `${Math.max(widthPct, 2)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Per-overlay timing controls */}
          <SectionLabel>個別設定</SectionLabel>
          {visibleOverlays.map((overlay) => {
            const isImage = overlay.type === "image";
            const label = isImage
              ? (overlay.text || "圖片")
              : stripHtml(overlay.text).slice(0, 20) || "（無文字）";

            return (
              <div key={overlay.id} className="rounded-lg bg-ls-surface-2 p-3 space-y-3">
                <span className="text-[11px] text-foreground font-medium truncate block">
                  {label}
                </span>

                {/* Animation type */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Zap className="w-3 h-3" />
                    動畫效果
                  </div>
                  <Select
                    value={overlay.animation}
                    onValueChange={(value: OverlayAnimation) =>
                      dispatch({
                        type: "UPDATE_OVERLAY",
                        slideIndex: currentSlide,
                        overlayId: overlay.id,
                        updates: { animation: value },
                      })
                    }
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {animationOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Delay */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      延遲
                    </span>
                    <span className="font-mono text-foreground">
                      {((overlay.delay ?? 0) / 1000).toFixed(1)}s
                    </span>
                  </div>
                  <Slider
                    value={[overlay.delay ?? 0]}
                    min={0}
                    max={5000}
                    step={100}
                    onValueChange={([v]) =>
                      dispatch({
                        type: "UPDATE_OVERLAY",
                        slideIndex: currentSlide,
                        overlayId: overlay.id,
                        updates: { delay: v },
                      })
                    }
                  />
                </div>

                {/* Duration */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">持續時間</span>
                    <span className="font-mono text-foreground">
                      {((overlay.duration ?? 500) / 1000).toFixed(1)}s
                    </span>
                  </div>
                  <Slider
                    value={[overlay.duration ?? 500]}
                    min={100}
                    max={5000}
                    step={100}
                    onValueChange={([v]) =>
                      dispatch({
                        type: "UPDATE_OVERLAY",
                        slideIndex: currentSlide,
                        overlayId: overlay.id,
                        updates: { duration: v },
                      })
                    }
                  />
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default TimelinePanel;
