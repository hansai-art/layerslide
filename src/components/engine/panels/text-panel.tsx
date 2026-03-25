import { useRef } from "react";
import { useEngine } from "@/hooks/use-engine";
import { useI18n } from "@/i18n/i18n-context";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Minus, Trash2, GripVertical, ImagePlus, Type as TypeIcon } from "lucide-react";
import type { OverlayPosition, OverlayAnimation } from "@/types/layerslide";
import { cn } from "@/lib/utils";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-mono uppercase tracking-widest text-ls-text-dim">{children}</p>
  );
}

/** Parse any CSS font-size to pt value */
function parsePt(fontSize?: string): number {
  if (!fontSize) return 32; // default ~2rem
  const val = parseFloat(fontSize);
  if (isNaN(val)) return 32;
  if (fontSize.includes("rem")) return Math.round(val * 16);
  if (fontSize.includes("px")) return Math.round(val * 0.75);
  return Math.round(val); // assume pt
}

const TEXT_COLORS = [
  { label: "白", value: "hsl(210, 20%, 92%)" },
  { label: "淺灰", value: "hsl(210, 10%, 70%)" },
  { label: "青", value: "hsl(180, 80%, 50%)" },
  { label: "紫", value: "hsl(260, 60%, 55%)" },
  { label: "藍", value: "hsl(220, 80%, 60%)" },
  { label: "綠", value: "hsl(140, 70%, 50%)" },
  { label: "黃", value: "hsl(45, 90%, 60%)" },
  { label: "橙", value: "hsl(25, 90%, 55%)" },
  { label: "紅", value: "hsl(0, 72%, 55%)" },
  { label: "粉", value: "hsl(330, 70%, 60%)" },
  { label: "深灰", value: "hsl(220, 10%, 30%)" },
  { label: "黑", value: "hsl(220, 20%, 10%)" },
];

const positionKeys: { value: OverlayPosition; key: string }[] = [
  { value: "top", key: "pos.top" },
  { value: "center", key: "pos.center" },
  { value: "bottom", key: "pos.bottom" },
  { value: "custom", key: "pos.custom" },
];

const animationKeys: { value: OverlayAnimation; key: string }[] = [
  { value: "fadeIn", key: "anim.fadeIn" },
  { value: "slideUp", key: "anim.slideUp" },
  { value: "typewriter", key: "anim.typewriter" },
  { value: "none", key: "anim.none" },
];

/** Interactive overlay editor (text + image) */
const TextPanel = () => {
  const { state, dispatch } = useEngine();
  const { t } = useI18n();
  const { currentSlide, slides } = state;
  const overlays = slides[currentSlide]?.overlays ?? [];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddText = () => {
    dispatch({
      type: "ADD_OVERLAY",
      slideIndex: currentSlide,
      overlay: {
        id: `overlay-${Date.now()}`,
        type: "text",
        text: "新文字區塊",
        position: "center",
        animation: "fadeIn",
        visible: true,
        style: {
          fontSize: "2rem",
          color: "hsl(210, 20%, 92%)",
        },
      },
    });
  };

  const handleAddImageUrl = () => {
    const url = prompt("輸入圖片網址 (URL)：");
    if (!url) return;
    dispatch({
      type: "ADD_OVERLAY",
      slideIndex: currentSlide,
      overlay: {
        id: `overlay-${Date.now()}`,
        type: "image",
        text: "",
        imageSrc: url,
        imageWidth: 400,
        position: "center",
        animation: "fadeIn",
        visible: true,
      },
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      dispatch({
        type: "ADD_OVERLAY",
        slideIndex: currentSlide,
        overlay: {
          id: `overlay-${Date.now()}`,
          type: "image",
          text: file.name,
          imageSrc: reader.result as string,
          imageWidth: 400,
          position: "center",
          animation: "fadeIn",
          visible: true,
        },
      });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeleteOverlay = (overlayId: string) => {
    dispatch({
      type: "REMOVE_OVERLAY",
      slideIndex: currentSlide,
      overlayId,
    });
  };

  return (
    <div className="space-y-4">
      {/* Add buttons */}
      <div className="flex items-center justify-between">
        <SectionLabel>{t("text.blocks")} ({overlays.length})</SectionLabel>
        <div className="flex gap-1">
          <button
            onClick={handleAddText}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-md text-[10px]",
              "bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            )}
          >
            <TypeIcon className="w-3 h-3" />
            {t("text.addText")}
          </button>
          <button
            onClick={handleAddImageUrl}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-md text-[10px]",
              "bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            )}
          >
            <ImagePlus className="w-3 h-3" />
            {t("text.addImage")}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-md text-[10px]",
              "bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            )}
          >
            <Plus className="w-3 h-3" />
            {t("text.upload")}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {overlays.length === 0 && (
        <p className="text-xs text-ls-text-dim text-center py-4">
          此投影片沒有覆蓋層，點擊上方按鈕新增文字或圖片。
        </p>
      )}

      {overlays.map((overlay) => {
        const isImage = overlay.type === "image";

        return (
          <div key={overlay.id} className="rounded-lg bg-ls-surface-2 p-3 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2">
              <GripVertical className="w-3 h-3 text-ls-text-dim flex-shrink-0" />
              <span className={cn(
                "text-[9px] font-mono px-1.5 py-0.5 rounded",
                isImage ? "bg-purple-500/20 text-purple-300" : "bg-primary/20 text-primary"
              )}>
                {isImage ? t("text.addImage") : t("text.addText")}
              </span>
              <span className="text-[11px] text-muted-foreground truncate flex-1">
                {isImage
                  ? (overlay.text || overlay.imageSrc?.split("/").pop()?.slice(0, 20) || t("text.addImage"))
                  : (overlay.text.replace(/<[^>]+>/g, "").slice(0, 20) || "（無文字）")}
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
              <button
                onClick={() => handleDeleteOverlay(overlay.id)}
                className="p-1 rounded hover:bg-destructive/10 text-ls-text-dim hover:text-destructive transition-colors"
                title={t("common.delete")}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {/* Image-specific controls */}
            {isImage && (
              <>
                {/* Preview */}
                {overlay.imageSrc && (
                  <div className="rounded-md overflow-hidden bg-ls-surface-1 p-1">
                    <img
                      src={overlay.imageSrc}
                      alt=""
                      className="w-full h-20 object-contain"
                    />
                  </div>
                )}

                {/* Image URL */}
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground">{t("text.imageUrl")}</span>
                  <Input
                    value={overlay.imageSrc ?? ""}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_OVERLAY",
                        slideIndex: currentSlide,
                        overlayId: overlay.id,
                        updates: { imageSrc: e.target.value },
                      })
                    }
                    className="h-7 text-xs font-mono bg-ls-surface-1"
                    placeholder="https://..."
                  />
                </div>

                {/* Width */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground">{t("text.width")}</span>
                    <span className="font-mono">{overlay.imageWidth ?? 400}px</span>
                  </div>
                  <Slider
                    value={[overlay.imageWidth ?? 400]}
                    min={50}
                    max={1200}
                    step={10}
                    onValueChange={([w]) =>
                      dispatch({
                        type: "UPDATE_OVERLAY",
                        slideIndex: currentSlide,
                        overlayId: overlay.id,
                        updates: { imageWidth: w },
                      })
                    }
                  />
                </div>

                {/* Opacity */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground">{t("text.opacity")}</span>
                    <span className="font-mono">{((overlay.imageOpacity ?? 1) * 100).toFixed(0)}%</span>
                  </div>
                  <Slider
                    value={[(overlay.imageOpacity ?? 1) * 100]}
                    min={10}
                    max={100}
                    step={5}
                    onValueChange={([v]) =>
                      dispatch({
                        type: "UPDATE_OVERLAY",
                        slideIndex: currentSlide,
                        overlayId: overlay.id,
                        updates: { imageOpacity: v / 100 },
                      })
                    }
                  />
                </div>

                {/* Border radius */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground">{t("text.borderRadius")}</span>
                    <span className="font-mono">{overlay.imageBorderRadius ?? 0}px</span>
                  </div>
                  <Slider
                    value={[overlay.imageBorderRadius ?? 0]}
                    min={0}
                    max={100}
                    step={4}
                    onValueChange={([r]) =>
                      dispatch({
                        type: "UPDATE_OVERLAY",
                        slideIndex: currentSlide,
                        overlayId: overlay.id,
                        updates: { imageBorderRadius: r },
                      })
                    }
                  />
                </div>
              </>
            )}

            {/* Text-specific controls */}
            {!isImage && (
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground">{t("text.content")}</span>
                <Textarea
                  value={overlay.text}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_OVERLAY",
                      slideIndex: currentSlide,
                      overlayId: overlay.id,
                      updates: { text: e.target.value },
                    })
                  }
                  className="text-xs font-mono bg-ls-surface-1 min-h-[60px] resize-none"
                  placeholder="輸入文字或 HTML..."
                />
              </div>
            )}

            {/* Shared controls: Position */}
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground">{t("text.position")}</span>
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
                  {positionKeys.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {t(opt.key)}
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
                    min={0} max={100} step={1}
                    onValueChange={([x]) =>
                      dispatch({
                        type: "UPDATE_OVERLAY",
                        slideIndex: currentSlide,
                        overlayId: overlay.id,
                        updates: { customPosition: { x, y: overlay.customPosition?.y ?? 50 } },
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
                    min={0} max={100} step={1}
                    onValueChange={([y]) =>
                      dispatch({
                        type: "UPDATE_OVERLAY",
                        slideIndex: currentSlide,
                        overlayId: overlay.id,
                        updates: { customPosition: { x: overlay.customPosition?.x ?? 50, y } },
                      })
                    }
                  />
                </div>
              </div>
            )}

            {/* Animation */}
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground">{t("text.animation")}</span>
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
                  {animationKeys.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {t(opt.key)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Text-only: font size + color */}
            {!isImage && (
              <>
                {/* Font size: +/- buttons */}
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground">{t("text.fontSize")}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const current = parsePt(overlay.style?.fontSize);
                        if (current <= 12) return;
                        dispatch({
                          type: "UPDATE_OVERLAY",
                          slideIndex: currentSlide,
                          overlayId: overlay.id,
                          updates: { style: { ...overlay.style, fontSize: `${current - 12}pt` } },
                        });
                      }}
                      className="flex items-center justify-center w-7 h-7 rounded-md bg-ls-surface-1 border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="flex-1 text-center text-xs font-mono text-foreground">
                      {parsePt(overlay.style?.fontSize)}pt
                    </span>
                    <button
                      onClick={() => {
                        const current = parsePt(overlay.style?.fontSize);
                        dispatch({
                          type: "UPDATE_OVERLAY",
                          slideIndex: currentSlide,
                          overlayId: overlay.id,
                          updates: { style: { ...overlay.style, fontSize: `${current + 12}pt` } },
                        });
                      }}
                      className="flex items-center justify-center w-7 h-7 rounded-md bg-ls-surface-1 border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Color picker */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-muted-foreground">{t("text.color")}</span>
                  <div className="grid grid-cols-6 gap-1.5">
                    {TEXT_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() =>
                          dispatch({
                            type: "UPDATE_OVERLAY",
                            slideIndex: currentSlide,
                            overlayId: overlay.id,
                            updates: { style: { ...overlay.style, color: c.value } },
                          })
                        }
                        className={cn(
                          "w-full aspect-square rounded-md border-2 transition-transform hover:scale-110",
                          overlay.style?.color === c.value
                            ? "border-white ring-1 ring-white/30"
                            : "border-transparent"
                        )}
                        style={{ backgroundColor: c.value }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })}

      {overlays.length > 0 && (
        <p className="text-[10px] text-ls-text-dim">
          Tip：開啟控制面板後，可以在畫面上直接拖曳覆蓋層定位。
        </p>
      )}
    </div>
  );
};

export default TextPanel;
