import { useEngine } from "@/hooks/use-engine";
import { getSketch, getSketchNames } from "@/sketches/registry";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import SketchParamsPanel from "./sketch-params-panel";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-mono uppercase tracking-widest text-ls-text-dim">{children}</p>
  );
}

/** Interactive background control panel */
const BackgroundPanel = () => {
  const { state, dispatch } = useEngine();
  const { background } = state;
  const currentSketch = getSketch(background.sketch ?? "");
  const sketchNames = getSketchNames();

  return (
    <div className="space-y-4">
      {/* Sketch selector */}
      <SectionLabel>選擇背景</SectionLabel>
      <div className="grid grid-cols-2 gap-2">
        {sketchNames.map((name) => (
          <button
            key={name}
            onClick={() => dispatch({ type: "SET_SKETCH", sketch: name })}
            className={cn(
              "rounded-lg bg-ls-surface-2 border border-border p-3 text-[11px]",
              "hover:border-primary/50 transition-colors text-left",
              background.sketch === name && "border-primary ring-1 ring-primary/20"
            )}
          >
            <span className="text-foreground font-medium">{name}</span>
          </button>
        ))}
      </div>

      {/* Opacity & Blur */}
      <SectionLabel>全域控制</SectionLabel>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">透明度</span>
            <span className="text-foreground font-mono text-[10px]">
              {((background.opacity ?? 1) * 100).toFixed(0)}%
            </span>
          </div>
          <Slider
            value={[(background.opacity ?? 1) * 100]}
            min={0}
            max={100}
            step={5}
            onValueChange={([v]) => dispatch({ type: "SET_BACKGROUND_OPACITY", opacity: v / 100 })}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">模糊度</span>
            <span className="text-foreground font-mono text-[10px]">
              {background.blur ?? 0}px
            </span>
          </div>
          <Slider
            value={[background.blur ?? 0]}
            min={0}
            max={20}
            step={1}
            onValueChange={([v]) => dispatch({ type: "SET_BACKGROUND_BLUR", blur: v })}
          />
        </div>
      </div>

      {/* Sketch-specific params */}
      {currentSketch && (
        <>
          <SectionLabel>Sketch 參數</SectionLabel>
          <SketchParamsPanel
            params={currentSketch.defaultParams}
            values={background.params ?? {}}
            onChange={(key, value) =>
              dispatch({ type: "UPDATE_BACKGROUND_PARAM", key, value })
            }
          />
        </>
      )}
    </div>
  );
};

export default BackgroundPanel;
