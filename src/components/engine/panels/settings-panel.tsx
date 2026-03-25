import { useRef } from "react";
import { useEngine } from "@/hooks/use-engine";
import {
  getBuiltInPresets,
  exportPreset,
  downloadPreset,
  parsePresetFile,
} from "../preset-manager";
import { cn } from "@/lib/utils";
import { Download, Upload, Package } from "lucide-react";
import { Switch } from "@/components/ui/switch";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-mono uppercase tracking-widest text-ls-text-dim">{children}</p>
  );
}

/** Settings panel with preset management */
const SettingsPanel = () => {
  const { state, dispatch } = useEngine();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const presets = getBuiltInPresets();

  const handleLoadPreset = (preset: { background: typeof state.background; slides: typeof state.slides }) => {
    dispatch({
      type: "LOAD_PRESET",
      slides: preset.slides,
      background: preset.background,
    });
  };

  const handleExport = () => {
    const preset = exportPreset(state, "my-preset", "User exported preset");
    downloadPreset(preset);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const preset = await parsePresetFile(file);
      handleLoadPreset(preset);
    } catch {
      console.error("Failed to parse preset file");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      {/* Built-in presets */}
      <SectionLabel>內建預設</SectionLabel>
      <div className="space-y-2">
        {presets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => handleLoadPreset(preset)}
            className={cn(
              "w-full text-left rounded-lg bg-ls-surface-2 border border-border p-3 transition-colors",
              "hover:border-primary/40"
            )}
          >
            <div className="flex items-center gap-2">
              <Package className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="text-[11px] text-foreground font-medium">{preset.name}</span>
            </div>
            {preset.description && (
              <p className="text-[10px] text-muted-foreground mt-1 ml-5">{preset.description}</p>
            )}
          </button>
        ))}
      </div>

      {/* Export/Import */}
      <SectionLabel>匯出 / 匯入</SectionLabel>
      <div className="flex gap-2">
        <button
          onClick={handleExport}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px]",
            "bg-ls-surface-2 border border-border text-muted-foreground",
            "hover:border-primary/40 hover:text-foreground transition-colors"
          )}
        >
          <Download className="w-3.5 h-3.5" />
          匯出 JSON
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px]",
            "bg-ls-surface-2 border border-border text-muted-foreground",
            "hover:border-primary/40 hover:text-foreground transition-colors"
          )}
        >
          <Upload className="w-3.5 h-3.5" />
          匯入 JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      {/* Performance */}
      <SectionLabel>效能</SectionLabel>
      <div className="rounded-lg bg-ls-surface-2 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">自動降級</span>
          <Switch
            checked={state.autoDegrade}
            onCheckedChange={(enabled) =>
              dispatch({ type: "SET_AUTO_DEGRADE", enabled })
            }
          />
        </div>
        <p className="text-[10px] text-ls-text-dim">
          FPS 低於 30 時自動降低粒子數量
        </p>
      </div>

      {/* Current state info */}
      <SectionLabel>目前狀態</SectionLabel>
      <div className="rounded-lg bg-ls-surface-2 p-3 space-y-1.5 text-[11px]">
        <div className="flex justify-between">
          <span className="text-muted-foreground">背景</span>
          <span className="text-foreground font-mono">{state.background.sketch ?? state.background.type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">投影片數</span>
          <span className="text-foreground font-mono">{state.slides.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">FPS</span>
          <span className="text-foreground font-mono">{state.fps}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">自動降級</span>
          <span className="text-foreground font-mono">{state.autoDegrade ? "開" : "關"}</span>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
