import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { useEngine } from "@/hooks/use-engine";
import { cn } from "@/lib/utils";
import type { ControlPanelTab } from "@/types/layerslide";

const STORAGE_KEY = "ls-onboarding-seen";

interface TourStep {
  title: string;
  description: string;
  details: string[];
  tip?: string;
  /** CSS selector for the element to highlight */
  target?: string;
  /** Actions to run when entering this step */
  panelOpen?: boolean;
  panelTab?: ControlPanelTab;
  /** Position of the tooltip relative to target */
  position?: "center" | "left" | "right" | "top" | "bottom";
}

const steps: TourStep[] = [
  {
    title: "歡迎使用 LayerSlide",
    description: "專業的層級式簡報系統：背景動畫永不中斷，文字與圖片即時編輯。",
    details: [
      "三層獨立渲染：背景層、投影片層、覆蓋層（文字 + 圖片）",
      "12 種內建生成式動畫背景，帶即時縮圖預覽",
      "所有修改自動儲存，支援中英雙語切換",
    ],
    tip: "接下來會依序展示各個功能區域。",
    position: "center",
  },
  {
    title: "底部縮圖列",
    description: "管理投影片的主要介面，類似 Canva / Google Slides。",
    details: [
      "點擊縮圖快速跳轉投影片",
      "「+」新增、複製、刪除投影片",
      "復原 / 重做按鈕（也可用 Ctrl+Z / Ctrl+Y）",
      "簡報者模式按鈕（F5）：計時器 + 講者筆記",
    ],
    target: "[data-tour='filmstrip']",
    position: "top",
    panelOpen: false,
  },
  {
    title: "背景控制",
    description: "按 P 開啟控制面板 →「背景」分頁，即時切換動畫。",
    details: [
      "12 種動畫（含 WebGL GPU 加速），帶即時縮圖預覽",
      "「瀏覽全部動畫」開啟動畫庫，按類別篩選",
      "每種動畫有獨立參數（速度、顏色、數量）",
      "全域透明度 / 模糊度滑桿",
      "「獨立背景」開關：每張投影片可用不同動畫",
    ],
    tip: "試試「aurora-borealis」極光或「spiral-galaxy」星系效果。",
    target: "[data-tour='control-panel']",
    position: "left",
    panelOpen: true,
    panelTab: "background",
  },
  {
    title: "文字與圖片編輯",
    description: "在「文字」分頁新增文字或圖片覆蓋層。",
    details: [
      "「文字」按鈕：新增文字區塊",
      "「圖片」按鈕：輸入 URL 插入圖片",
      "「上傳」按鈕：從本地上傳圖片",
      "拖曳畫面上的文字/圖片到任意位置",
      "雙擊文字：直接在畫面上編輯（inline editing）",
      "點擊文字：開啟浮動工具列（粗體、斜體、對齊、色盤）",
    ],
    target: "[data-tour='control-panel']",
    position: "left",
    panelOpen: true,
    panelTab: "text",
  },
  {
    title: "動畫時間軸",
    description: "在「時間軸」分頁控制覆蓋層的出場節奏。",
    details: [
      "視覺化時間軸：彩色長條圖顯示每個覆蓋層的時間",
      "延遲：設定覆蓋層延遲多久才出現（0~5 秒）",
      "持續時間：設定動畫播放時長（0.1~5 秒）",
      "動畫效果：淡入、上滑、打字機、無",
    ],
    tip: "設定不同的延遲讓覆蓋層依序出場，更有節奏感。",
    target: "[data-tour='control-panel']",
    position: "left",
    panelOpen: true,
    panelTab: "animation",
  },
  {
    title: "導航與講者筆記",
    description: "在「導航」分頁跳轉投影片、編輯講者筆記。",
    details: [
      "投影片列表：點擊直接跳轉",
      "講者筆記：輸入文字，F5 簡報者模式會顯示",
      "快捷鍵速查表",
    ],
    target: "[data-tour='control-panel']",
    position: "left",
    panelOpen: true,
    panelTab: "navigation",
  },
  {
    title: "設定與匯出",
    description: "在「設定」分頁管理轉場、預設、匯出、語系。",
    details: [
      "轉場動畫：淡入淡出、左滑、上滑、縮放、無",
      "內建預設：一鍵切換風格",
      "匯出 JSON：儲存配置分享他人",
      "匯出 HTML：產生獨立 HTML 檔案（含動畫背景），雙擊即可播放",
      "語系切換：繁中 / English",
    ],
    target: "[data-tour='control-panel']",
    position: "left",
    panelOpen: true,
    panelTab: "settings",
  },
  {
    title: "準備開始！",
    description: "你已經掌握所有功能了。",
    details: [
      "P：控制面板 | F5：簡報者模式",
      "Ctrl+Z：復原 | Ctrl+Y：重做 | Delete：刪除選取覆蓋層",
      "雙擊文字：直接編輯 | 拖曳：移動位置",
      "手機/平板：左右滑動切換投影片",
      "左下角「?」隨時重開此導覽",
    ],
    tip: "開始探索吧！",
    position: "center",
    panelOpen: false,
  },
];

const OnboardingTutorial = () => {
  const { dispatch } = useEngine();
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Auto-open on first visit
  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      setOpen(true);
    }
  }, []);

  // Apply step actions and find target element
  const applyStep = useCallback(
    (stepIndex: number) => {
      const step = steps[stepIndex];
      if (!step) return;

      // Open/close panel
      if (step.panelOpen !== undefined) {
        dispatch({ type: "SET_PANEL_OPEN", open: step.panelOpen });
      }
      // Switch tab
      if (step.panelTab) {
        dispatch({ type: "SET_PANEL_TAB", tab: step.panelTab });
      }

      // Find target element after DOM updates
      setTimeout(() => {
        if (step.target) {
          const el = document.querySelector(step.target);
          if (el) {
            setTargetRect(el.getBoundingClientRect());
            return;
          }
        }
        setTargetRect(null);
      }, 350); // wait for panel animation
    },
    [dispatch]
  );

  useEffect(() => {
    if (open) {
      applyStep(currentStep);
    }
  }, [open, currentStep, applyStep]);

  const handleClose = () => {
    setOpen(false);
    setCurrentStep(0);
    setTargetRect(null);
    localStorage.setItem(STORAGE_KEY, "true");
    dispatch({ type: "SET_PANEL_OPEN", open: false });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  };

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;
  const isCentered = step.position === "center" || !targetRect;

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (isCentered) {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const pad = 16;
    const tooltipW = 420;

    switch (step.position) {
      case "top":
        return {
          position: "fixed",
          bottom: window.innerHeight - targetRect!.top + pad,
          left: Math.max(pad, targetRect!.left + targetRect!.width / 2 - tooltipW / 2),
        };
      case "left":
        return {
          position: "fixed",
          top: Math.max(pad, targetRect!.top),
          right: window.innerWidth - targetRect!.left + pad,
        };
      default:
        return {
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        };
    }
  };

  // Spotlight overlay with hole
  const getSpotlightClipPath = (): string | undefined => {
    if (!targetRect) return undefined;
    const pad = 8;
    const x = targetRect.left - pad;
    const y = targetRect.top - pad;
    const w = targetRect.width + pad * 2;
    const h = targetRect.height + pad * 2;
    const r = 12;
    // polygon with a rounded-ish hole
    return `polygon(
      0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
      ${x}px ${y + r}px,
      ${x + r}px ${y}px,
      ${x + w - r}px ${y}px,
      ${x + w}px ${y + r}px,
      ${x + w}px ${y + h - r}px,
      ${x + w - r}px ${y + h}px,
      ${x + r}px ${y + h}px,
      ${x}px ${y + h - r}px,
      ${x}px ${y + r}px
    )`;
  };

  if (!open) {
    return (
      <button
        onClick={() => {
          setOpen(true);
          setCurrentStep(0);
        }}
        className={cn(
          "fixed z-[6] flex items-center justify-center",
          "w-10 h-10 rounded-full",
          "bg-ls-surface-1 border border-border text-muted-foreground",
          "hover:text-foreground hover:border-primary/40 transition-all duration-200",
          "shadow-lg shadow-black/20"
        )}
        style={{ bottom: 140, left: 16 }}
        aria-label="開啟新手教學"
      >
        <HelpCircle className="w-5 h-5" />
      </button>
    );
  }

  return (
    <>
      {/* Spotlight overlay: very subtle, just enough to draw attention to target */}
      <div
        className="fixed inset-0 z-[50] pointer-events-none"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.15)",
          clipPath: getSpotlightClipPath(),
          transition: "clip-path 0.4s ease-out",
        }}
      />

      {/* Target highlight border */}
      {targetRect && (
        <div
          className="fixed z-[50] pointer-events-none rounded-xl"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            border: "2px solid hsl(180, 80%, 50%)",
            boxShadow: "0 0 20px rgba(0, 210, 190, 0.3), inset 0 0 20px rgba(0, 210, 190, 0.05)",
            transition: "all 0.4s ease-out",
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        className="z-[51] w-[420px] max-w-[calc(100vw-2rem)]"
        style={getTooltipStyle()}
      >
        <div className="bg-ls-surface-1 border border-border rounded-xl shadow-2xl shadow-black/40 overflow-hidden">
          {/* Progress bar */}
          <div className="flex gap-1 px-5 pt-5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors duration-300",
                  i === currentStep
                    ? "bg-primary"
                    : i < currentStep
                    ? "bg-primary/40"
                    : "bg-ls-surface-3"
                )}
              />
            ))}
          </div>

          <div className="px-5 pb-2 pt-4">
            <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{step.description}</p>

            <div className="mt-3 space-y-1.5">
              {step.details.map((detail, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-foreground/85">
                  <span className="flex-shrink-0 w-5 h-5 rounded bg-ls-surface-3 flex items-center justify-center text-[10px] font-mono text-muted-foreground mt-0.5">
                    {i + 1}
                  </span>
                  <span>{detail}</span>
                </div>
              ))}
            </div>

            {step.tip && (
              <div className="mt-3 rounded-lg bg-primary/5 border border-primary/15 px-3 py-2">
                <p className="text-xs text-primary/80">
                  <span className="font-semibold">Tip: </span>{step.tip}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-ls-surface-0/50">
            <span className="text-xs text-muted-foreground font-mono">
              {currentStep + 1} / {steps.length}
            </span>
            <div className="flex gap-2">
              {!isFirst && (
                <Button variant="outline" size="sm" onClick={handlePrev} className="gap-1 h-8">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  上一步
                </Button>
              )}
              {isFirst && (
                <Button variant="ghost" size="sm" onClick={handleClose} className="text-muted-foreground h-8">
                  跳過
                </Button>
              )}
              <Button size="sm" onClick={handleNext} className="gap-1 h-8">
                {isLast ? "開始使用" : "下一步"}
                {!isLast && <ArrowRight className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingTutorial;
