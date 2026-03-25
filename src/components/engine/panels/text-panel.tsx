import { useEngine } from "@/hooks/use-engine";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import type { OverlayPosition, OverlayAnimation } from "@/types/layerslide";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-mono uppercase tracking-widest text-ls-text-dim">{children}</p>
  );
}

const positionOptions: { value: OverlayPosition; label: string }[] = [
  { value: "top", label: "頂部" },
  { value: "center", label: "中間" },
  { value: "bottom", label: "底部" },
  { value: "custom", label: "自訂" },
];

const animationOptions: { value: OverlayAnimation; label: string }[] = [
  { value: "fadeIn", label: "淡入" },
  { value: "slideUp", label: "上滑" },
  { value: "typewriter", label: "打字機" },
  { value: "none", label: "無" },
];

/** Interactive text overlay editor */
const TextPanel = () => {
  const { state, dispatch } = useEngine();
  const { currentSlide, slides } = state;
  const overlays = slides[currentSlide]?.overlays ?? [];

  return (
    <div className="space-y-4">
      <SectionLabel>文字區塊 ({overlays.length})</SectionLabel>

      {overlays.map((overlay) => (
        <div key={overlay.id} className="rounded-lg bg-ls-surface-2 p-3 space-y-3">
          {/* Visibility toggle */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground truncate max-w-[180px]">
              {overlay.text.replace(/<[^>]+>/g, "").slice(0, 30) || "（無文字）"}
            </span>
            <Switch
              checked={overlay.visible}
              onCheckedChange={(visible) =>
                dispatch({
                  type: "SET_OVERLAY_VISIBILITY",
                  slideIndex: currentSlide,
                  overlayId: overlay.id,
                  visible,
                })
              }
            />
          </div>

          {/* Position */}
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground">位置</span>
            <Select
              value={overlay.position}
              onValueChange={(value: OverlayPosition) =>
                dispatch({
                  type: "UPDATE_OVERLAY",
                  slideIndex: currentSlide,
                  overlayId: overlay.id,
                  updates: { position: value },
                })
              }
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {positionOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom position sliders */}
          {overlay.position === "custom" && (
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">X</span>
                  <span className="font-mono">{overlay.customPosition?.x ?? 50}%</span>
                </div>
                <Slider
                  value={[overlay.customPosition?.x ?? 50]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([x]) =>
                    dispatch({
                      type: "UPDATE_OVERLAY",
                      slideIndex: currentSlide,
                      overlayId: overlay.id,
                      updates: {
                        customPosition: { x, y: overlay.customPosition?.y ?? 50 },
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">Y</span>
                  <span className="font-mono">{overlay.customPosition?.y ?? 50}%</span>
                </div>
                <Slider
                  value={[overlay.customPosition?.y ?? 50]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([y]) =>
                    dispatch({
                      type: "UPDATE_OVERLAY",
                      slideIndex: currentSlide,
                      overlayId: overlay.id,
                      updates: {
                        customPosition: { x: overlay.customPosition?.x ?? 50, y },
                      },
                    })
                  }
                />
              </div>
            </div>
          )}

          {/* Animation */}
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground">動畫</span>
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

          {/* Font size */}
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground">字體大小</span>
            <Input
              value={overlay.style?.fontSize ?? "2rem"}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_OVERLAY",
                  slideIndex: currentSlide,
                  overlayId: overlay.id,
                  updates: { style: { ...overlay.style, fontSize: e.target.value } },
                })
              }
              className="h-7 text-xs font-mono bg-ls-surface-1"
            />
          </div>

          {/* Color */}
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground">文字顏色</span>
            <Input
              value={overlay.style?.color ?? "hsl(210, 20%, 92%)"}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_OVERLAY",
                  slideIndex: currentSlide,
                  overlayId: overlay.id,
                  updates: { style: { ...overlay.style, color: e.target.value } },
                })
              }
              className="h-7 text-xs font-mono bg-ls-surface-1"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TextPanel;
