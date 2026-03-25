import { useState } from "react";
import { useEngine } from "@/hooks/use-engine";
import { getSketch, getSketchNames } from "@/sketches/registry";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import SketchParamsPanel from "./sketch-params-panel";
import SketchPreview from "./sketch-preview";
import SketchGallery from "./sketch-gallery";
import type { BackgroundConfig } from "@/types/layerslide";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-mono uppercase tracking-widest text-ls-text-dim">{children}</p>
  );
}

/** Interactive background control panel */
const BackgroundPanel = () => {
  const { state, dispatch } = useEngine();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const sketchNames = getSketchNames();

  // Per-slide background override
  const currentSlideBackground = state.slides[state.currentSlide]?.background;
  const activeBackground: BackgroundConfig = currentSlideBackground ?? state.background;
  const currentSketch = getSketch(activeBackground.sketch ?? "");

  // Helper: dispatch to per-slide or global background
  const dispatchSketch = (sketch: string) => {
    if (currentSlideBackground) {
      dispatch({
        type: "SET_SLIDE_BACKGROUND",
        slideIndex: state.currentSlide,
        background: { ...activeBackground, type: "generator", sketch },
      });
    } else {
      dispatch({ type: "SET_SKETCH", sketch });
    }
  };

  const dispatchOpacity = (opacity: number) => {
    if (currentSlideBackground) {
      dispatch({
        type: "SET_SLIDE_BACKGROUND",
        slideIndex: state.currentSlide,
        background: { ...activeBackground, opacity },
      });
    } else {
      dispatch({ type: "SET_BACKGROUND_OPACITY", opacity });
    }
  };

  const dispatchBlur = (blur: number) => {
    if (currentSlideBackground) {
      dispatch({
        type: "SET_SLIDE_BACKGROUND",
        slideIndex: state.currentSlide,
        background: { ...activeBackground, blur },
      });
    } else {
      dispatch({ type: "SET_BACKGROUND_BLUR", blur });
    }
  };

  const dispatchParam = (key: string, value: unknown) => {
    if (currentSlideBackground) {
      dispatch({
        type: "SET_SLIDE_BACKGROUND",
        slideIndex: state.currentSlide,
        background: {
          ...activeBackground,
          params: { ...activeBackground.params, [key]: value },
        },
      });
    } else {
      dispatch({ type: "UPDATE_BACKGROUND_PARAM", key, value });
    }
  };

  return (
    <div className="space-y-4">
      {/* Per-slide background toggle */}
      <SectionLabel>投影片背景</SectionLabel>
      <div className="rounded-lg bg-ls-surface-2 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">此投影片使用獨立背景</span>
          <Switch
            checked={!!currentSlideBackground}
            onCheckedChange={(checked) => {
              if (checked) {
                // Copy current global bg as per-slide override
                dispatch({
                  type: "SET_SLIDE_BACKGROUND",
                  slideIndex: state.currentSlide,
                  background: { ...state.background },
                });
              } else {
                dispatch({
                  type: "SET_SLIDE_BACKGROUND",
                  slideIndex: state.currentSlide,
                  background: null,
                });
              }
            }}
          />
        </div>
        {currentSlideBackground && (
          <p className="text-[10px] text-primary">使用獨立背景中</p>
        )}
      </div>

      {/* Sketch selector with visual previews */}
      <SectionLabel>選擇背景</SectionLabel>
      <div className="grid grid-cols-2 gap-2">
        {sketchNames.map((name) => (
          <button
            key={name}
            onClick={() => dispatchSketch(name)}
            className={cn(
              "rounded-lg bg-ls-surface-2 border border-border overflow-hidden",
              "hover:border-primary/50 transition-colors text-left",
              activeBackground.sketch === name && "border-primary ring-1 ring-primary/20"
            )}
          >
            <SketchPreview sketchName={name} width={120} height={68} />
            <div className="p-2">
              <span className="text-foreground font-medium text-[11px]">{name}</span>
            </div>
          </button>
        ))}
      </div>
      <button
        onClick={() => setGalleryOpen(true)}
        className="w-full rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
      >
        瀏覽全部動畫
      </button>
      <SketchGallery
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        onSelect={(name) => dispatchSketch(name)}
        activeSketch={activeBackground.sketch}
      />

      {/* Opacity & Blur */}
      <SectionLabel>全域控制</SectionLabel>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">透明度</span>
            <span className="text-foreground font-mono text-[10px]">
              {((activeBackground.opacity ?? 1) * 100).toFixed(0)}%
            </span>
          </div>
          <Slider
            value={[(activeBackground.opacity ?? 1) * 100]}
            min={0}
            max={100}
            step={5}
            onValueChange={([v]) => dispatchOpacity(v / 100)}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">模糊度</span>
            <span className="text-foreground font-mono text-[10px]">
              {activeBackground.blur ?? 0}px
            </span>
          </div>
          <Slider
            value={[activeBackground.blur ?? 0]}
            min={0}
            max={20}
            step={1}
            onValueChange={([v]) => dispatchBlur(v)}
          />
        </div>
      </div>

      {/* Sketch-specific params */}
      {currentSketch && (
        <>
          <SectionLabel>Sketch 參數</SectionLabel>
          <SketchParamsPanel
            params={currentSketch.defaultParams}
            values={activeBackground.params ?? {}}
            onChange={dispatchParam}
          />
        </>
      )}
    </div>
  );
};

export default BackgroundPanel;
