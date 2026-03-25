import PresentationEngine from "@/components/engine/PresentationEngine";
import type { BackgroundConfig, SlideConfig } from "@/types/layerslide";
import { loadAutoSave } from "@/hooks/use-auto-save";

// Demo background
const demoBackground: BackgroundConfig = {
  type: "generator",
  sketch: "particle-network",
  params: {
    particleCount: 100,
    lineDistance: 140,
    color: "0, 210, 190",
    speed: 0.4,
  },
  opacity: 1,
  blur: 0,
};

// Demo slides
const demoSlides: SlideConfig[] = [
  {
    id: "slide-1",
    overlays: [
      {
        id: "title",
        text: "<h1 style='font-size:3.5rem;font-weight:700;letter-spacing:-0.02em;margin-bottom:0.5rem'>LayerSlide</h1><p style='font-size:1.1rem;opacity:0.7;font-weight:300'>層級式簡報系統 · 背景永不中斷，文字隨時更換</p>",
        position: "center",
        animation: "fadeIn",
        visible: true,
        style: {
          color: "hsl(210, 20%, 92%)",
          textShadow: "0 4px 30px rgba(0,0,0,0.5)",
        },
      },
    ],
    notes: "歡迎介紹 LayerSlide 的核心理念：背景不中斷的簡報體驗。",
  },
  {
    id: "slide-2",
    overlays: [
      {
        id: "arch-title",
        text: "<h2 style='font-size:2rem;font-weight:600;margin-bottom:0.3rem'>三層架構</h2><p style='font-size:0.95rem;opacity:0.6'>背景層 → 投影片層 → 文字覆蓋層</p>",
        position: "top",
        animation: "fadeIn",
        visible: true,
        style: {
          color: "hsl(210, 20%, 92%)",
          textShadow: "0 2px 20px rgba(0,0,0,0.4)",
          padding: "2rem 2rem 1rem",
        },
      },
      {
        id: "arch-detail",
        text: "<div style='display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;font-size:0.85rem'><div style='background:rgba(0,210,190,0.1);border:1px solid rgba(0,210,190,0.2);border-radius:12px;padding:1.5rem;text-align:center'><div style='font-size:1.5rem;margin-bottom:0.5rem'>🎬</div><strong>背景層</strong><p style='opacity:0.6;margin-top:0.3rem'>持續播放的影片、動畫或生成式背景</p></div><div style='background:rgba(130,100,255,0.1);border:1px solid rgba(130,100,255,0.2);border-radius:12px;padding:1.5rem;text-align:center'><div style='font-size:1.5rem;margin-bottom:0.5rem'>📄</div><strong>投影片層</strong><p style='opacity:0.6;margin-top:0.3rem'>透明背景的投影片內容</p></div><div style='background:rgba(255,200,50,0.1);border:1px solid rgba(255,200,50,0.2);border-radius:12px;padding:1.5rem;text-align:center'><div style='font-size:1.5rem;margin-bottom:0.5rem'>✏️</div><strong>覆蓋層</strong><p style='opacity:0.6;margin-top:0.3rem'>即時可編輯的文字與控制面板</p></div></div>",
        position: "center",
        animation: "fadeIn",
        visible: true,
        style: {
          color: "hsl(210, 20%, 92%)",
          textShadow: "none",
        },
      },
    ],
    notes: "解釋三層架構的設計哲學：每層獨立渲染，互不干擾。",
  },
  {
    id: "slide-3",
    overlays: [
      {
        id: "features",
        text: "<h2 style='font-size:2rem;font-weight:600;margin-bottom:1rem'>核心功能</h2><ul style='list-style:none;font-size:0.95rem;line-height:2.2;opacity:0.85'><li>⚡ 背景切換零中斷 — 影片、Canvas、生成式動畫</li><li>✏️ 即時文字編輯 — 簡報中隨時修改內容</li><li>🎛️ 控制台面板 — 按 P 呼出，即時調控所有參數</li><li>📦 離線優先 — 靜態 HTML，雙擊即可運行</li><li>🎨 生成式動畫引擎 — 內建 Sketch 庫，零素材需求</li></ul>",
        position: "center",
        animation: "fadeIn",
        visible: true,
        style: {
          color: "hsl(210, 20%, 92%)",
          textShadow: "0 2px 20px rgba(0,0,0,0.4)",
        },
      },
    ],
    notes: "逐一介紹五大核心功能，重點強調零素材需求。",
  },
  {
    id: "slide-4",
    overlays: [
      {
        id: "cta",
        text: "<p style='font-size:1rem;opacity:0.5;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.5rem'>按 P 開啟控制面板</p><h2 style='font-size:2.5rem;font-weight:700'>開始探索</h2><p style='font-size:0.9rem;opacity:0.5;margin-top:0.5rem'>← → 方向鍵切換投影片 | F5 簡報者模式</p>",
        position: "center",
        animation: "fadeIn",
        visible: true,
        style: {
          color: "hsl(210, 20%, 92%)",
          textShadow: "0 4px 30px rgba(0,0,0,0.5)",
        },
      },
    ],
    notes: "邀請觀眾自己動手試試。提醒 F5 可以進入簡報者模式。",
  },
];

// Load auto-saved state or fall back to demo
const saved = loadAutoSave();

const Index = () => {
  return (
    <PresentationEngine
      slides={saved?.slides ?? demoSlides}
      background={saved?.background ?? demoBackground}
    />
  );
};

export default Index;
