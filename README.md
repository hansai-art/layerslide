# LayerSlide

**層級式簡報系統** — 背景動畫永不中斷，文字內容即時編輯。

A layer-based presentation system with persistent animated backgrounds, real-time text editing, and professional presenter mode. Built with React + Vite + Tailwind.

---

## 功能總覽 / Features

### 三層渲染架構

LayerSlide 採用獨立的三層渲染，每層互不干擾：

| 層級 | 說明 | 技術 |
|------|------|------|
| **Layer 0 背景層** | 持續播放的生成式動畫，切換投影片時不中斷 | Canvas 2D |
| **Layer 1 投影片層** | 透明背景的投影片內容，支援 5 種轉場效果 | React DOM |
| **Layer 2 覆蓋層** | 即時可編輯的文字覆蓋，支援拖曳定位 | React DOM |

### 8 種內建動畫背景

所有動畫皆使用原生 Canvas 2D API，不依賴 P5.js 或 Three.js：

- `particle-network` 粒子網路
- `starfield` 星空穿越
- `wave-gradient` 波浪漸層
- `bokeh-lights` 散景光點
- `matrix-rain` 矩陣雨
- `noise-terrain` 噪聲地形
- `geometric-morph` 幾何變形
- `fluid-sim` 流體模擬

每種動畫都有獨立的參數調整器（速度、顏色、數量等），可在控制面板中即時調整。

### 專業編輯器

- **底部縮圖列**：投影片縮圖，新增 / 複製 / 刪除按鈕（類似 Canva / Google Slides）
- **浮動工具列**：點擊文字出現 WYSIWYG 工具列（粗體、斜體、底線、對齊、字體大小、色盤）
- **拖曳定位**：開啟控制面板後，直接拖曳文字到任意位置
- **復原 / 重做**：50 層歷史記錄（Ctrl+Z / Ctrl+Y）
- **自動儲存**：所有修改自動存到 localStorage，重開頁面不遺失

### 簡報者模式（F5）

- 自動計時器（開始 / 暫停 / 重置）
- 每張投影片的講者筆記
- 下一張投影片預覽
- 全螢幕切換

### 控制面板（P 鍵）

| 分頁 | 功能 |
|------|------|
| 背景 | 切換 8 種動畫、調整參數、透明度、模糊度 |
| 文字 | 新增 / 編輯 / 刪除文字區塊、位置、動畫、樣式 |
| 導航 | 投影片列表、講者筆記編輯、快捷鍵速查 |
| 設定 | 轉場動畫選擇、Preset 管理（JSON 匯出入）、自動降級開關 |

### 新手教學

首次開啟自動彈出 8 步互動教學，左下角 `?` 按鈕可隨時重新開啟。

---

## 技術架構 / Tech Stack

| 項目 | 技術 |
|------|------|
| 框架 | React 18 + TypeScript |
| 建置工具 | Vite 5 |
| 樣式 | Tailwind CSS 3 + shadcn/ui |
| 狀態管理 | useReducer + React Context |
| 動畫引擎 | 原生 Canvas 2D API |
| 圖示 | Lucide React |

---

## 快速開始 / Quick Start

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 生產環境建置
npm run build
```

---

## 快捷鍵 / Keyboard Shortcuts

| 按鍵 | 功能 |
|------|------|
| `→` / `Space` | 下一張投影片 |
| `←` | 上一張投影片 |
| `P` | 開啟 / 關閉控制面板 |
| `F5` | 簡報者模式 |
| `Ctrl+Z` | 復原 |
| `Ctrl+Y` | 重做 |
| `Esc` | 退出簡報者模式 |

---

## 專案結構 / Project Structure

```
src/
├── components/engine/          # 簡報引擎核心
│   ├── PresentationEngine.tsx  # 主控制器
│   ├── BackgroundLayer.tsx     # Layer 0：Canvas 動畫執行器
│   ├── SlideLayer.tsx          # Layer 1：投影片轉場
│   ├── OverlayLayer.tsx        # Layer 2：可拖曳文字覆蓋
│   ├── ControlPanel.tsx        # 側邊控制面板（P 鍵）
│   ├── slide-filmstrip.tsx     # 底部縮圖列
│   ├── floating-toolbar.tsx    # 浮動文字工具列
│   ├── presenter-mode.tsx      # F5 簡報者模式
│   ├── onboarding-tutorial.tsx # 新手教學
│   ├── slide-transition.tsx    # 轉場效果
│   ├── preset-manager.ts       # JSON 預設組合管理
│   ├── background-manager.ts   # 背景 Crossfade
│   ├── state/
│   │   ├── engine-reducer.ts   # 狀態 + Actions + Undo/Redo
│   │   └── engine-context.tsx  # React Context Provider
│   └── panels/
│       ├── background-panel.tsx    # 背景控制面板
│       ├── text-panel.tsx          # 文字編輯面板
│       ├── navigation-panel.tsx    # 導航 + 筆記面板
│       ├── settings-panel.tsx      # 設定面板
│       └── sketch-params-panel.tsx # Sketch 參數自動 UI
├── sketches/                   # 8 個 Canvas 動畫模組
│   ├── registry.ts             # 名稱 → 模組映射
│   ├── particle-network.ts
│   ├── starfield.ts
│   ├── wave-gradient.ts
│   ├── bokeh-lights.ts
│   ├── matrix-rain.ts
│   ├── noise-terrain.ts
│   ├── geometric-morph.ts
│   └── fluid-sim.ts
├── hooks/                      # 自訂 Hooks
│   ├── use-engine.ts           # 引擎 Context Hook
│   ├── use-auto-save.ts        # localStorage 自動儲存
│   ├── use-fps-monitor.ts      # FPS 監控 + 自動降級
│   ├── use-fullscreen.ts       # 全螢幕 API
│   └── use-visibility-pause.ts # 分頁隱藏時暫停動畫
├── types/
│   └── layerslide.ts           # 所有 TypeScript 型別定義
├── presets/                    # 內建預設組合
│   ├── demo-default.json
│   └── demo-minimal.json
└── pages/
    └── Index.tsx               # 進入點（Demo 投影片）
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

然後在 `src/sketches/registry.ts` 註冊：

```typescript
import mySketch from "./my-sketch";
sketchRegistry["my-sketch"] = mySketch;
```

註冊後會自動出現在控制面板的背景選擇器中。

### 建立預設組合 Preset

透過設定 > 匯出 JSON 匯出目前配置，或手動建立：

```json
{
  "name": "我的預設",
  "description": "自訂配置說明",
  "background": {
    "type": "generator",
    "sketch": "starfield",
    "params": { "starCount": 500, "speed": 3 },
    "opacity": 1,
    "blur": 0
  },
  "slides": [
    {
      "id": "slide-1",
      "overlays": [
        {
          "id": "title",
          "text": "<h1>Hello World</h1>",
          "position": "center",
          "animation": "fadeIn",
          "visible": true
        }
      ],
      "notes": "講者筆記寫在這裡"
    }
  ]
}
```

---

## 架構設計決策 / Architecture Decisions

| 決策 | 理由 |
|------|------|
| **不使用 reveal.js** | 自訂投影片系統，完全掌控轉場和層級渲染 |
| **僅使用 Canvas 2D** | 不依賴 WebGL / Three.js，相容性最高、bundle 最小 |
| **useReducer 而非 Redux** | 單頁應用不需要外部狀態管理庫 |
| **Sketch 模組化** | 標準化介面，新增動畫只需建檔 + 註冊 |
| **Auto-save 版本控制** | Schema 變更時自動失效舊存檔，避免載入損壞資料 |

---

## 授權 / License

MIT License. 詳見 [LICENSE](LICENSE)。

---

Built by [Hans Lin / Group.G](https://github.com/hansai-art)
