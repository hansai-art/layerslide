# LayerSlide

**層級式簡報系統**：背景動畫永不中斷，文字與圖片即時編輯。

A layer-based presentation system with persistent animated backgrounds, real-time overlay editing, and professional presenter tools.

**[線上 Demo](https://layerslide.lovable.app/)**

---

## 為什麼需要 LayerSlide？ / Why LayerSlide?

傳統簡報工具（PowerPoint、Google Slides、Keynote）每次切換投影片時，背景都會跟著切斷重來。如果你用了一段精心設計的動畫背景，換頁就沒了。

Prezi 雖然有連續動畫，但它的操作邏輯完全不同（zoom-based），學習成本高，客製化能力有限。

Canva 在動畫方面很弱，背景只能用靜態圖片或簡單漸層。

**LayerSlide 的核心理念：把背景和內容完全解耦。**

```
┌─────────────────────────────────────────┐
│  Layer 2：文字 + 圖片覆蓋層（即時編輯）    │  ← 切換投影片時更新
│─────────────────────────────────────────│
│  Layer 1：投影片內容（轉場動畫）           │  ← 切換投影片時更新
│─────────────────────────────────────────│
│  Layer 0：生成式動畫背景（永不中斷）        │  ← 永遠在跑，不受投影片影響
└─────────────────────────────────────────┘
```

這個設計讓你可以：
- 用粒子網路當背景，上面的文字隨意換，背景一直在動
- 第 1 張用星空背景、第 3 張換成波浪，轉場時背景平滑 crossfade
- 簡報過程中即時調參數（調粒子速度、改背景顏色），觀眾看不到控制面板

---

## 跟其他簡報工具的差別 / Comparison

| 功能 | PowerPoint | Google Slides | Canva | Prezi | **LayerSlide** |
|------|:---:|:---:|:---:|:---:|:---:|
| **連續動畫背景** | 不支援 | 不支援 | 不支援 | 部分支援 | 12 種生成式動畫 |
| **背景不隨投影片中斷** | 不支援 | 不支援 | 不支援 | 支援 | 支援 + crossfade |
| **每頁獨立背景** | 支援 | 支援 | 支援 | 不支援 | 支援 + 動畫過渡 |
| **即時參數調整** | 不支援 | 不支援 | 不支援 | 不支援 | 所有動畫參數即時調 |
| **程式碼可擴充動畫** | 不支援 | 不支援 | 不支援 | 不支援 | Sketch 模組化系統 |
| **離線獨立 HTML 匯出** | 不支援 | 不支援 | PDF 才行 | 不支援 | 一鍵匯出含動畫 |
| **開源免費** | 付費 | 免費但封閉 | 免費但封閉 | 付費 | MIT 開源 |
| **拖曳定位覆蓋層** | 支援 | 支援 | 支援 | 支援 | 支援 |
| **WYSIWYG 文字編輯** | 支援 | 支援 | 支援 | 支援 | 浮動工具列 + inline 編輯 |
| **圖片插入** | 支援 | 支援 | 支援 | 支援 | URL / 上傳 / 拖曳定位 |
| **簡報者模式** | 支援 | 支援 | 不支援 | 支援 | 計時器 + 筆記 + 全螢幕 |
| **動畫時間軸** | 支援 | 基本 | 不支援 | 基本 | 視覺化時間軸 + 延遲/持續 |
| **觸控手勢** | 支援 | 支援 | 支援 | 支援 | 左右滑動 |
| **Undo/Redo** | 支援 | 支援 | 支援 | 支援 | 50 層歷史 |
| **多語系** | 支援 | 支援 | 支援 | 支援 | 繁中 / English |

### LayerSlide 的獨特優勢

1. **背景是活的**：不是靜態圖片或 GIF，是即時運算的 Canvas 動畫，每次播放都不一樣
2. **切換不中斷**：背景動畫在投影片切換時繼續播放，沒有任何閃爍或重置
3. **開發者友善**：想加新動畫？寫一個 TypeScript 檔案、註冊到 registry，控制面板自動出現 UI
4. **真正離線**：匯出的 HTML 包含完整動畫引擎，雙擊就能播放，不需要網路
5. **零依賴動畫**：全部用原生 Canvas 2D，不裝 P5.js / Three.js / GSAP，bundle 只有 ~150KB gzipped

### LayerSlide 不適合的場景

- 需要大量排版的文件型簡報（用 Google Slides）
- 需要素材庫和模板的商業簡報（用 Canva）
- 需要團隊協作和版本控制（用 Google Slides）
- 需要 3D 效果（未來可能支援）

---

## 功能總覽 / Features

### 三層渲染架構

| 層級 | 說明 | 技術 |
|------|------|------|
| **Layer 0 背景層** | 持續播放的生成式動畫，切換投影片時不中斷 | Canvas 2D |
| **Layer 1 投影片層** | 透明背景的投影片內容，支援 5 種轉場效果 | React DOM |
| **Layer 2 覆蓋層** | 文字 + 圖片覆蓋，支援拖曳定位、動畫時間軸 | React DOM |

### 12 種內建動畫背景

Canvas 2D + WebGL GPU 加速，帶有即時縮圖預覽。「瀏覽全部動畫」開啟 Sketch 動畫庫，按類別篩選（自然/科技/幾何/抽象）：

| Sketch | 效果 | 特色參數 |
|--------|------|---------|
| `particle-network` | 粒子網路 | 粒子數、連線距離、速度 |
| `starfield` | 星空穿越 | 星星數、深度、尾跡長度 |
| `wave-gradient` | 波浪漸層 | 波浪層數、振幅、雙色漸變 |
| `bokeh-lights` | 散景光點 | 光點數、半徑、色相範圍 |
| `matrix-rain` | 矩陣雨 | 字體大小、密度、顏色 |
| `noise-terrain` | 噪聲地形 | 行數、振幅、透視 |
| `geometric-morph` | 幾何變形 | 邊數、層數、旋轉/變形速度 |
| `fluid-sim` | 流體模擬 | 流體數、閾值、解析度 |
| `aurora-borealis` | 極光 | 光帶數、強度、星星數 |
| `spiral-galaxy` | 螺旋星系 | 旋臂數、星星數、旋轉速度 |
| `rain-ripples` | 雨滴漣漪 | 雨滴速率、漣漪速度、閃電開關 |
| `shader-gradient` | GPU 漸層 (WebGL) | 速度、雙色、複雜度 |

### 專業編輯器

- **底部縮圖列**：投影片管理（新增/複製/刪除），類似 Canva
- **浮動工具列**：點擊文字出現 WYSIWYG 工具列（B/I/U、對齊、大小、色盤）
- **Inline 編輯**：雙擊文字直接在畫面上修改，所見即所得
- **圖片覆蓋層**：URL 貼入或本地上傳，寬度/透明度/圓角可調
- **拖曳定位**：文字和圖片都可以拖到畫面任意位置
- **每頁獨立背景**：每張投影片可選擇不同動畫，切換時 crossfade
- **動畫時間軸**：視覺化時間軸 + 延遲/持續時間控制
- **字體大小**：12pt 加減按鈕
- **色盤**：12 色視覺選擇器
- **Undo/Redo**：50 層歷史（Ctrl+Z / Ctrl+Y）
- **自動儲存**：所有修改即時存到 localStorage

### 簡報者模式（F5）

- 浮動工具列（不遮擋背景動畫）
- 自動計時器（開始/暫停/重置）
- 每張投影片的講者筆記
- 下一張投影片預覽
- 全螢幕：所有 UI 消失，只剩背景 + 內容

### 匯出功能

- **JSON**：儲存完整配置，分享或備份
- **獨立 HTML**：自包含檔案，含粒子動畫背景 + 鍵盤/觸控導航，雙擊即播放

### 控制面板（P 鍵）

| 分頁 | 功能 |
|------|------|
| 背景 | Canvas 縮圖預覽選擇器、每頁獨立背景開關、參數/透明度/模糊度 |
| 文字 | 文字/圖片覆蓋層 CRUD、位置/動畫選擇、12pt 字體大小、12 色色盤 |
| 時間軸 | 視覺化長條圖、延遲(0~5s)/持續時間(0.1~5s)控制 |
| 導航 | 投影片列表、講者筆記編輯器、快捷鍵速查 |
| 設定 | 5 種轉場、內建 Preset、JSON/HTML 匯出入、自動降級、語系切換 |

---

## 技術架構 / Tech Stack

| 項目 | 技術 | 為什麼選它 |
|------|------|-----------|
| 框架 | React 18 + TypeScript | 元件化 + 型別安全 |
| 建置 | Vite 5 | 極速 HMR，2 秒建置 |
| 樣式 | Tailwind CSS 3 + shadcn/ui | 原子化 CSS + 高品質 UI 元件 |
| 狀態 | useReducer + Context | 不需要 Redux 的複雜度 |
| 動畫 | 原生 Canvas 2D | 零依賴、最高相容性、~150KB gzipped |
| 圖示 | Lucide React | 輕量、一致的圖示系統 |
| i18n | 自建 Context | 繁中/English，輕量無依賴 |

---

## 快速開始 / Quick Start

```bash
git clone https://github.com/hansai-art/layerslide.git
cd layerslide
npm install
npm run dev
```

開啟 http://localhost:5173，你會看到 Demo 投影片。

---

## 快捷鍵 / Keyboard Shortcuts

| 按鍵 | 功能 |
|------|------|
| `→` / `Space` | 下一張投影片 |
| `←` | 上一張投影片 |
| `P` | 開啟/關閉控制面板 |
| `F5` | 簡報者模式 |
| `Ctrl+Z` | 復原 |
| `Ctrl+Y` | 重做 |
| `Ctrl+S` | 手動儲存 |
| `Delete` | 刪除選取的覆蓋層 |
| `Esc` | 退出全螢幕/簡報者模式 |
| 雙擊文字 | 進入 inline 編輯 |
| 拖曳 | 移動覆蓋層位置 |
| 左右滑動 | 觸控切換投影片 |

---

## 專案結構 / Project Structure

```
src/
├── components/engine/          # 簡報引擎核心
│   ├── PresentationEngine.tsx  # 主控制器：組合三層 + UI
│   ├── BackgroundLayer.tsx     # Layer 0：Canvas 動畫 + crossfade
│   ├── SlideLayer.tsx          # Layer 1：投影片轉場效果
│   ├── OverlayLayer.tsx        # Layer 2：文字/圖片覆蓋 + 拖曳 + inline 編輯
│   ├── ControlPanel.tsx        # 側邊控制面板（5 個分頁）
│   ├── slide-filmstrip.tsx     # 底部縮圖列 + CRUD 按鈕
│   ├── floating-toolbar.tsx    # 浮動 WYSIWYG 文字工具列
│   ├── presenter-mode.tsx      # F5 簡報者模式（計時器+筆記）
│   ├── onboarding-tutorial.tsx # 互動式新手導覽（9 步 + spotlight）
│   ├── slide-transition.tsx    # 5 種轉場效果引擎
│   ├── html-exporter.ts        # 獨立 HTML 匯出（含粒子動畫）
│   ├── preset-manager.ts       # JSON 預設組合管理
│   ├── background-manager.ts   # 背景 crossfade 邏輯
│   ├── state/
│   │   ├── engine-reducer.ts   # 狀態 + 30+ Actions + 50 層 Undo/Redo
│   │   └── engine-context.tsx  # React Context Provider
│   └── panels/
│       ├── background-panel.tsx    # 背景選擇器 + 參數面板
│       ├── text-panel.tsx          # 文字/圖片覆蓋層編輯
│       ├── timeline-panel.tsx      # 動畫時間軸
│       ├── navigation-panel.tsx    # 導航 + 講者筆記
│       ├── settings-panel.tsx      # 轉場/Preset/匯出/語系
│       ├── sketch-preview.tsx      # Sketch Canvas 即時縮圖
│       └── sketch-params-panel.tsx # 參數自動生成 UI
├── sketches/                   # 8 個 Canvas 動畫模組
├── hooks/                      # 7 個自訂 Hooks
├── i18n/                       # 繁中/English 翻譯系統
├── presets/                    # 2 個內建預設組合
├── types/                      # TypeScript 型別定義
└── pages/
    └── Index.tsx               # Demo 投影片進入點
```

---

## 開發指南 / Development Guide

### 新增自訂動畫 Sketch

在 `src/sketches/` 建立新檔案，實作 `SketchModule` 介面：

```typescript
import type { SketchModule, SketchParamDef } from "@/types/layerslide";

const mySketch: SketchModule = {
  name: "my-sketch",
  defaultParams: {
    speed: { type: "number", label: "速度", default: 1, min: 0.1, max: 5, step: 0.1 },
    color: { type: "color", label: "顏色", default: "0, 255, 128" },
  },
  setup(canvas, params) { /* 初始化 */ },
  draw(ctx, time, params) { /* 每幀渲染 */ },
  updateParams(params) { /* 參數變更時 */ },
  destroy() { /* 清理資源 */ },
  resize(w, h) { /* 視窗大小變更 */ },
};

export default mySketch;
```

在 `src/sketches/registry.ts` 註冊：

```typescript
import mySketch from "./my-sketch";
sketchRegistry["my-sketch"] = mySketch;
```

註冊後自動出現在控制面板，帶即時縮圖預覽和參數 UI。

### 建立預設組合

設定 tab > 匯出 JSON，或手動建立：

```json
{
  "name": "我的預設",
  "background": {
    "type": "generator",
    "sketch": "starfield",
    "params": { "starCount": 500, "speed": 3 }
  },
  "slides": [
    {
      "id": "slide-1",
      "overlays": [
        {
          "id": "title",
          "text": "<h1>Hello</h1>",
          "position": "center",
          "animation": "fadeIn",
          "visible": true,
          "delay": 0,
          "duration": 500
        }
      ],
      "notes": "講者筆記"
    }
  ]
}
```

---

## 架構設計決策 / Architecture Decisions

| 決策 | 理由 |
|------|------|
| **不使用 reveal.js** | 自訂系統才能實現三層獨立渲染，reveal.js 做不到背景不中斷 |
| **Canvas 2D 而非 WebGL** | 相容性最高（IE11 除外），不需要 GPU，bundle 更小 |
| **useReducer + Context** | 30+ actions 足以用 reducer 管理，不需要 Redux 的 middleware |
| **Sketch 模組化介面** | `setup/draw/updateParams/destroy` 四個方法，新增動畫只需一個檔案 |
| **Auto-save 版本號** | localStorage schema 變更時自動失效舊資料，避免載入格式不符的存檔 |
| **absolute 而非 fixed 定位** | fixed 在 fullscreen element 內行為異常，absolute 更可靠 |
| **CSS display:none 隱藏 UI** | 全螢幕時用 CSS 隱藏而非 conditional render，避免 canvas 重新掛載 |

---

## 未來方向 / Roadmap

- [x] 更多高品質 Sketch 動畫（極光、星系、雨滴漣漪）
- [x] Sketch 動畫庫（分類瀏覽 + 一鍵套用）
- [x] WebGL GPU 加速渲染（shader-gradient，自動 fallback Canvas 2D）
- [ ] 雲端儲存 + 分享連結
- [ ] PDF 匯出
- [ ] 協作編輯

---

## 授權 / License

MIT License. 詳見 [LICENSE](LICENSE)。

自由使用、修改、商用。歡迎 PR 和 Issue。

---

Built by [Hans Lin / Group.G](https://github.com/hansai-art)
