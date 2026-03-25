import { useState } from "react";
import { Layers, Image, Type, Navigation, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import type { ControlPanelTab } from "@/types/layerslide";
import { useEngine } from "@/hooks/use-engine";
import { cn } from "@/lib/utils";
import BackgroundPanel from "./panels/background-panel";
import TextPanel from "./panels/text-panel";
import NavigationPanel from "./panels/navigation-panel";
import SettingsPanel from "./panels/settings-panel";

interface ControlPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

const tabs: { id: ControlPanelTab; label: string; icon: typeof Layers }[] = [
  { id: "background", label: "背景", icon: Image },
  { id: "text", label: "文字", icon: Type },
  { id: "navigation", label: "導航", icon: Navigation },
  { id: "settings", label: "設定", icon: Settings },
];

/** Control Panel: Side panel for real-time control (P key toggle) */
const ControlPanel = ({ isOpen, onToggle }: ControlPanelProps) => {
  const { state } = useEngine();
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
        <span>P</span>
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
            {state.currentSlide + 1} / {state.slides.length}
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
          {activeTab === "background" && <BackgroundPanel />}
          {activeTab === "text" && <TextPanel />}
          {activeTab === "navigation" && <NavigationPanel />}
          {activeTab === "settings" && <SettingsPanel />}
        </div>
      </div>
    </>
  );
};

export default ControlPanel;
