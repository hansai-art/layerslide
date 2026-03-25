import { useState } from "react";
import { Layers, Image, Type, Navigation, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import type { ControlPanelTab, BackgroundConfig, TextOverlay } from "@/types/layerslide";
import { cn } from "@/lib/utils";

interface ControlPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  background: BackgroundConfig;
  overlays: TextOverlay[];
  currentSlide: number;
  totalSlides: number;
}

const tabs: { id: ControlPanelTab; label: string; icon: typeof Layers }[] = [
  { id: "background", label: "背景", icon: Image },
  { id: "text", label: "文字", icon: Type },
  { id: "navigation", label: "導航", icon: Navigation },
  { id: "settings", label: "設定", icon: Settings },
];

/** Control Panel — Side panel for real-time control (F9 toggle) */
const ControlPanel = ({
  isOpen,
  onToggle,
  background,
  overlays,
  currentSlide,
  totalSlides,
}: ControlPanelProps) => {
  const [activeTab, setActiveTab] = useState<ControlPanelTab>("background");

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className={cn(
          "fixed top-4 z-[11] flex items-center gap-1.5 px-3 py-2 rounded-lg",
          "bg-ls-surface-1 border border-border text-muted-foreground",
          "hover:text-foreground hover:border-primary/40 transition-all duration-200",
          "text-xs font-mono",
          isOpen ? "right-[calc(320px+1rem)]" : "right-4"
        )}
      >
        {isOpen ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        <span>F9</span>
      </button>

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-80 border-l border-border",
          "bg-ls-panel-bg backdrop-blur-md z-10",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Layers className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground tracking-wide">LayerSlide</span>
          <span className="ml-auto text-[10px] font-mono text-ls-text-dim">
            {currentSlide + 1} / {totalSlides}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors",
                activeTab === tab.id
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-4 overflow-y-auto h-[calc(100%-120px)]">
          {activeTab === "background" && (
            <BackgroundPanel config={background} />
          )}
          {activeTab === "text" && (
            <TextPanel overlays={overlays} />
          )}
          {activeTab === "navigation" && (
            <div className="text-xs text-muted-foreground space-y-2">
              <p>投影片導航面板</p>
              <p className="text-ls-text-dim">（待實作：投影片縮圖預覽）</p>
            </div>
          )}
          {activeTab === "settings" && (
            <div className="text-xs text-muted-foreground space-y-2">
              <p>系統設定</p>
              <p className="text-ls-text-dim">（待實作：快捷鍵、計時器）</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

function BackgroundPanel({ config }: { config: BackgroundConfig }) {
  return (
    <div className="space-y-4">
      <SectionLabel>當前背景</SectionLabel>
      <div className="rounded-lg bg-ls-surface-2 p-3 space-y-2">
        <Row label="類型" value={config.type} />
        {config.sketch && <Row label="Sketch" value={config.sketch} />}
        <Row label="透明度" value={`${(config.opacity ?? 1) * 100}%`} />
        <Row label="模糊度" value={`${config.blur ?? 0}px`} />
      </div>

      <SectionLabel>可用背景</SectionLabel>
      <div className="grid grid-cols-2 gap-2">
        {["particle-network", "starfield", "wave-gradient", "bokeh-lights"].map((name) => (
          <button
            key={name}
            className={cn(
              "rounded-lg bg-ls-surface-2 border border-border p-3 text-[11px]",
              "hover:border-primary/50 transition-colors text-left",
              config.sketch === name && "border-primary ring-1 ring-primary/20"
            )}
          >
            <span className="text-foreground font-medium">{name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function TextPanel({ overlays }: { overlays: TextOverlay[] }) {
  return (
    <div className="space-y-4">
      <SectionLabel>文字區塊 ({overlays.length})</SectionLabel>
      {overlays.map((o) => (
        <div key={o.id} className="rounded-lg bg-ls-surface-2 p-3 space-y-2">
          <Row label="位置" value={o.position} />
          <Row label="動畫" value={o.animation} />
          <Row label="可見" value={o.visible ? "是" : "否"} />
          <p className="text-[11px] text-muted-foreground truncate">{o.text.replace(/<[^>]+>/g, "")}</p>
        </div>
      ))}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-mono uppercase tracking-widest text-ls-text-dim">{children}</p>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between text-[11px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-mono">{value}</span>
    </div>
  );
}

export default ControlPanel;
