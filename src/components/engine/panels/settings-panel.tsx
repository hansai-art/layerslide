import { useRef } from "react";
import { useEngine } from "@/hooks/use-engine";
import {
  getBuiltInPresets,
  exportPreset,
  downloadPreset,
  parsePresetFile,
} from "../preset-manager";
import { cn } from "@/lib/utils";
import { Download, Upload, Package, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TransitionType } from "@/types/layerslide";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-mono uppercase tracking-widest text-ls-text-dim">{children}</p>
  );
}

const transitionOptions: { value: TransitionType; label: string }[] = [
  { value: "fade", label: "淡入淡出" },
  { value: "slide-left", label: "左滑" },
  { value: "slide-up", label: "上滑" },
  { value: "zoom", label: "縮放" },
  { value: "none", label: "無" },
];

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

  const handleClearSave = () => {
    localStorage.removeItem("ls-auto-save");
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      {/* Transition */}
      <SectionLabel>轉場動畫</SectionLabel>
      <Select
        value={state.transition}
        onValueChange={(value: TransitionType) =>
          dispatch({ type: "SET_TRANSITION", transition: value })
        }
      >
        <SelectTrigger className="h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {transitionOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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
          <span className="text-muted-foreground">歷史記錄</span>
          <span className="text-foreground font-mono">{state.history.length} 步</span>
        </div>
      </div>

      {/* Reset */}
      <SectionLabel>重置</SectionLabel>
      <button
        onClick={handleClearSave}
        className={cn(
          "w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px]",
          "bg-destructive/10 border border-destructive/20 text-destructive",
          "hover:bg-destructive/20 transition-colors"
        )}
      >
        <Trash2 className="w-3.5 h-3.5" />
        清除自動儲存並重置
      </button>
    </div>
  );
};

export default SettingsPanel;
