import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Keyboard,
  Layers,
  Palette,
  Type,
  Navigation,
  Settings,
  MonitorPlay,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "ls-onboarding-seen";

interface TutorialStep {
  icon: typeof Layers;
  title: string;
  description: string;
  details: string[];
  tip?: string;
}

const steps: TutorialStep[] = [
  {
    icon: Layers,
    title: "歡迎使用 LayerSlide",
    description: "LayerSlide 是一個層級式簡報系統，讓你的簡報背景永不中斷，文字內容隨時切換。",
    details: [
      "三層獨立渲染：背景層、投影片層、文字覆蓋層",
      "8 種內建生成式動畫背景，零素材需求",
      "即時控制面板，所有參數都可以在簡報中調整",
    ],
    tip: "接下來幾頁會介紹各項操作方式，讓你快速上手。",
  },
  {
    icon: Keyboard,
    title: "基本操作",
    description: "使用鍵盤和滑鼠控制簡報播放。",
    details: [
      "→ 方向鍵 / 空白鍵：下一張投影片",
      "← 方向鍵：上一張投影片",
      "P：開啟 / 關閉控制面板",
      "F5：開啟簡報者模式（計時器 + 筆記）",
      "Ctrl+Z / Cmd+Z：復原操作",
      "Ctrl+Y / Cmd+Shift+Z：重做操作",
      "底部縮圖列：點擊投影片快速跳轉",
    ],
  },
  {
    icon: Palette,
    title: "背景控制",
    description: "按 P 開啟控制面板，在「背景」分頁中即時切換和調整背景。",
    details: [
      "8 種生成式動畫可選：粒子網路、星空、波浪漸層、散景光點、矩陣雨、噪聲地形、幾何變形、流體模擬",
      "每種動畫都有獨立的參數調整器（速度、顏色、數量等）",
      "全域控制：透明度、模糊度滑桿",
      "切換背景時有 1 秒平滑過渡動畫",
    ],
    tip: "試試看切換到「starfield」背景，調整速度感受星空穿越的效果。",
  },
  {
    icon: Type,
    title: "文字編輯",
    description: "在「文字」分頁中編輯目前投影片的文字覆蓋層。",
    details: [
      "開關：控制每個文字區塊的顯示 / 隱藏",
      "位置：頂部、中間、底部、或自訂 XY 座標",
      "動畫：淡入、上滑、打字機效果、或無動畫",
      "樣式：字體大小、文字顏色即時調整",
    ],
  },
  {
    icon: Navigation,
    title: "投影片導航",
    description: "在「導航」分頁中快速跳轉到任意投影片。",
    details: [
      "上一張 / 下一張按鈕快速切換",
      "投影片列表：點擊任何一張直接跳轉",
      "顯示每張投影片的文字預覽",
      "快捷鍵速查表",
    ],
  },
  {
    icon: Settings,
    title: "設定與預設組合",
    description: "在「設定」分頁中管理預設組合和效能選項。",
    details: [
      "內建預設：一鍵載入「預設 Demo」或「極簡 Demo」",
      "匯出 JSON：將目前的所有設定匯出為 JSON 檔案",
      "匯入 JSON：載入先前儲存的預設組合",
      "自動降級：FPS 過低時自動降低粒子數量，確保流暢",
    ],
    tip: "你可以把調整好的配置匯出存檔，下次直接匯入就能還原。",
  },
  {
    icon: MonitorPlay,
    title: "準備開始",
    description: "你已經了解 LayerSlide 的所有功能了！",
    details: [
      "按 P 開啟控制面板，開始探索各種設定",
      "用方向鍵瀏覽 Demo 投影片",
      "在「設定」分頁切換不同的內建預設",
      "隨時點擊左下角的「?」按鈕重新開啟此教學",
    ],
    tip: "祝你簡報順利！",
  },
];

interface OnboardingTutorialProps {
  forceOpen?: boolean;
}

const OnboardingTutorial = ({ forceOpen }: OnboardingTutorialProps) => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Auto-open on first visit
  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      setCurrentStep(0);
      return;
    }
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      setOpen(true);
    }
  }, [forceOpen]);

  const handleClose = () => {
    setOpen(false);
    setCurrentStep(0);
    localStorage.setItem(STORAGE_KEY, "true");
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
  const StepIcon = step.icon;
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  return (
    <>
      {/* Help button (bottom-left) */}
      <button
        onClick={() => {
          setOpen(true);
          setCurrentStep(0);
        }}
        className={cn(
          "fixed bottom-4 left-4 z-[11] flex items-center justify-center",
          "w-10 h-10 rounded-full",
          "bg-ls-surface-1 border border-border text-muted-foreground",
          "hover:text-foreground hover:border-primary/40 transition-all duration-200",
          "shadow-lg shadow-black/20"
        )}
        aria-label="開啟新手教學"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {/* Tutorial dialog */}
      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
        <DialogContent className="max-w-xl bg-ls-surface-1 border-border p-0 overflow-hidden">
          {/* Step indicator */}
          <div className="flex gap-1 px-6 pt-6">
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

          <div className="px-6 pb-2 pt-4">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20">
                  <StepIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-lg text-foreground">
                    {step.title}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                    {step.description}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Details list */}
            <div className="mt-4 space-y-2">
              {step.details.map((detail, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-foreground/85"
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded bg-ls-surface-3 flex items-center justify-center text-[10px] font-mono text-muted-foreground mt-0.5">
                    {i + 1}
                  </span>
                  <span>{detail}</span>
                </div>
              ))}
            </div>

            {/* Tip */}
            {step.tip && (
              <div className="mt-4 rounded-lg bg-primary/5 border border-primary/15 px-4 py-3">
                <p className="text-xs text-primary/80">
                  <span className="font-semibold">Tip: </span>
                  {step.tip}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-ls-surface-0/50">
            <div className="text-xs text-muted-foreground font-mono">
              {currentStep + 1} / {steps.length}
            </div>
            <div className="flex gap-2">
              {!isFirst && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  className="gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  上一步
                </Button>
              )}
              {isFirst && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-muted-foreground"
                >
                  跳過教學
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleNext}
                className="gap-1"
              >
                {isLast ? "開始使用" : "下一步"}
                {!isLast && <ArrowRight className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OnboardingTutorial;
