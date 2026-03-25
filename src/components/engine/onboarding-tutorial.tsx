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
  MonitorPlay,
  Settings,
  MousePointerClick,
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
    description: "LayerSlide 是專業的層級式簡報系統，背景動畫永不中斷，文字內容即時編輯。",
    details: [
      "三層獨立渲染：背景層、投影片層、文字覆蓋層",
      "8 種內建生成式動畫背景，零素材需求",
      "所有修改自動儲存，重開頁面不會遺失",
      "完整的投影片管理：新增、複製、刪除、排序",
    ],
    tip: "接下來會依序介紹各項操作，大約 2 分鐘就能上手。",
  },
  {
    icon: Keyboard,
    title: "快捷鍵總覽",
    description: "熟悉這些快捷鍵，讓你的操作更流暢。",
    details: [
      "→ / 空白鍵：下一張投影片",
      "←：上一張投影片",
      "P：開啟 / 關閉控制面板",
      "F5：開啟簡報者模式（計時器 + 講者筆記）",
      "Ctrl+Z (Cmd+Z)：復原",
      "Ctrl+Y (Cmd+Shift+Z)：重做",
      "Esc：關閉簡報者模式",
    ],
  },
  {
    icon: MousePointerClick,
    title: "底部縮圖列",
    description: "畫面底部的縮圖列是管理投影片的主要介面。",
    details: [
      "點擊縮圖快速跳轉到該投影片",
      "「+」按鈕：在目前位置後新增空白投影片",
      "複製按鈕：複製目前投影片",
      "刪除按鈕：刪除目前投影片",
      "復原 / 重做按鈕：撤銷或重做操作",
      "簡報者模式按鈕：開啟 F5 簡報模式",
    ],
  },
  {
    icon: Palette,
    title: "背景控制",
    description: "按 P 開啟控制面板 →「背景」分頁，即時切換動畫背景。",
    details: [
      "8 種動畫：粒子網路、星空、波浪、散景、矩陣雨、噪聲地形、幾何變形、流體",
      "每種動畫有獨立參數（速度、顏色、數量等）",
      "全域透明度 / 模糊度滑桿",
      "切換背景時有 1 秒平滑過渡",
    ],
    tip: "試試「starfield」+ 調高速度，感受星空穿越。",
  },
  {
    icon: Type,
    title: "文字編輯",
    description: "有兩種方式編輯文字：控制面板或浮動工具列。",
    details: [
      "控制面板「文字」分頁：新增 / 刪除文字區塊、調整位置、動畫、大小、顏色",
      "浮動工具列：開啟控制面板後點擊畫面上的文字，出現 WYSIWYG 工具列",
      "工具列功能：粗體、斜體、底線、對齊、字體大小、色盤",
      "拖曳定位：開啟控制面板後，直接拖曳文字到任意位置",
    ],
    tip: "拖曳文字時會自動切換到「自訂位置」模式。",
  },
  {
    icon: Settings,
    title: "設定與進階功能",
    description: "控制面板「設定」分頁管理轉場、預設、效能。",
    details: [
      "轉場動畫：淡入淡出、左滑、上滑、縮放、無",
      "內建預設：一鍵載入不同風格的簡報配置",
      "匯出 / 匯入 JSON：儲存和分享你的配置",
      "自動降級：FPS 過低時自動減少粒子數",
      "清除儲存：重置為預設 Demo",
    ],
  },
  {
    icon: MonitorPlay,
    title: "簡報者模式",
    description: "按 F5 進入專業簡報者視圖。",
    details: [
      "自動計時器：開啟後自動開始計時，可暫停/重置",
      "講者筆記：在「導航」分頁編輯，簡報模式中顯示",
      "下一張預覽：提前知道下一張投影片內容",
      "全螢幕切換：一鍵進入全螢幕演講",
      "Esc 鍵隨時退出",
    ],
    tip: "在「導航」分頁為每張投影片寫講者筆記，簡報時會很有幫助。",
  },
  {
    icon: Layers,
    title: "準備開始！",
    description: "你已經掌握 LayerSlide 的所有功能了。",
    details: [
      "底部縮圖列：管理投影片",
      "P 鍵：開啟控制面板調整一切",
      "F5：簡報者模式，正式演講必備",
      "所有修改自動儲存，放心編輯",
      "左下角「?」按鈕可隨時重新開啟此教學",
    ],
    tip: "開始探索吧！",
  },
];

interface OnboardingTutorialProps {
  forceOpen?: boolean;
}

const OnboardingTutorial = ({ forceOpen }: OnboardingTutorialProps) => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

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
      {/* Help button: above filmstrip */}
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

      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
        <DialogContent className="max-w-xl bg-ls-surface-1 border-border p-0 overflow-hidden">
          {/* Progress bar */}
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

            {step.tip && (
              <div className="mt-4 rounded-lg bg-primary/5 border border-primary/15 px-4 py-3">
                <p className="text-xs text-primary/80">
                  <span className="font-semibold">Tip: </span>
                  {step.tip}
                </p>
              </div>
            )}
          </div>

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
