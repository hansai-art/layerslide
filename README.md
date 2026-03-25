# LayerSlide

**層級式簡報系統** — 背景動畫永不中斷，文字內容即時編輯。

LayerSlide is a layer-based presentation system built with React + Vite + Tailwind. It features persistent animated backgrounds, real-time text editing, and a professional presenter mode.

## Features

### Three-Layer Architecture
- **Layer 0 (Background)**: 8 procedurally generated canvas animations — particle network, starfield, wave gradient, bokeh lights, matrix rain, noise terrain, geometric morph, fluid simulation
- **Layer 1 (Slides)**: Transparent slide content with 5 transition effects (fade, slide-left, slide-up, zoom, none)
- **Layer 2 (Overlays)**: Real-time editable text overlays with drag-to-position and WYSIWYG floating toolbar

### Professional Editor
- **Bottom Filmstrip**: Slide thumbnails with add/duplicate/delete buttons (like Canva/Google Slides)
- **Floating Toolbar**: Bold, italic, underline, alignment, font size, color picker — appears on overlay click
- **Drag Positioning**: Drag text overlays anywhere on screen when control panel is open
- **Undo/Redo**: 50-level history stack (Ctrl+Z / Ctrl+Y)
- **Auto-Save**: All changes saved to localStorage automatically

### Presenter Mode (F5)
- Timer with play/pause/reset
- Speaker notes per slide
- Next slide preview
- Fullscreen toggle

### Control Panel (P key)
- **Background**: Switch between 8 sketches, adjust parameters (speed, color, count, etc.), opacity/blur
- **Text**: Add/edit/delete overlays, position, animation, font size, color
- **Navigation**: Slide list with notes editor, keyboard shortcuts reference
- **Settings**: Transition selector, preset management (JSON export/import), auto-degrade toggle

### Onboarding
- 8-step interactive tutorial on first visit
- Help button (?) to reopen anytime

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 + shadcn/ui |
| State | useReducer + React Context |
| Animations | Native Canvas 2D API (no P5.js/Three.js) |
| Icons | Lucide React |

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Production build
npm run build
```

## Project Structure

```
src/
├── components/engine/          # Core presentation engine
│   ├── PresentationEngine.tsx  # Main orchestrator
│   ├── BackgroundLayer.tsx     # Layer 0: canvas sketch runner
│   ├── SlideLayer.tsx          # Layer 1: slide transitions
│   ├── OverlayLayer.tsx        # Layer 2: draggable text overlays
│   ├── ControlPanel.tsx        # Side panel (P key)
│   ├── slide-filmstrip.tsx     # Bottom thumbnail strip
│   ├── floating-toolbar.tsx    # WYSIWYG text toolbar
│   ├── presenter-mode.tsx      # F5 presenter view
│   ├── onboarding-tutorial.tsx # First-visit tutorial
│   ├── slide-transition.tsx    # Transition effects
│   ├── preset-manager.ts       # JSON preset export/import
│   ├── background-manager.ts   # Crossfade logic
│   ├── state/
│   │   ├── engine-reducer.ts   # State + actions + undo/redo
│   │   └── engine-context.tsx  # React Context provider
│   └── panels/
│       ├── background-panel.tsx
│       ├── text-panel.tsx
│       ├── navigation-panel.tsx
│       ├── settings-panel.tsx
│       └── sketch-params-panel.tsx
├── sketches/                   # 8 canvas animation modules
│   ├── registry.ts             # Sketch name → module mapping
│   ├── particle-network.ts
│   ├── starfield.ts
│   ├── wave-gradient.ts
│   ├── bokeh-lights.ts
│   ├── matrix-rain.ts
│   ├── noise-terrain.ts
│   ├── geometric-morph.ts
│   └── fluid-sim.ts
├── hooks/
│   ├── use-engine.ts           # Engine context hook
│   ├── use-auto-save.ts        # localStorage persistence
│   ├── use-fps-monitor.ts      # FPS tracking + auto-degrade
│   ├── use-fullscreen.ts       # Fullscreen API
│   └── use-visibility-pause.ts # Pause on tab hidden
├── types/
│   └── layerslide.ts           # All TypeScript definitions
├── presets/
│   ├── demo-default.json
│   └── demo-minimal.json
└── pages/
    └── Index.tsx               # Entry point with demo slides
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `→` / `Space` | Next slide |
| `←` | Previous slide |
| `P` | Toggle control panel |
| `F5` | Presenter mode |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Esc` | Exit presenter mode |

## Adding a Custom Sketch

Create a new file in `src/sketches/` implementing the `SketchModule` interface:

```typescript
import type { SketchModule, SketchParamDef } from "@/types/layerslide";

const mySketch: SketchModule = {
  name: "my-sketch",
  defaultParams: {
    speed: { type: "number", label: "Speed", default: 1, min: 0.1, max: 5, step: 0.1 },
    color: { type: "color", label: "Color", default: "0, 255, 128" },
  },
  setup(canvas, params) { /* init */ },
  draw(ctx, time, params) { /* render frame */ },
  updateParams(params) { /* handle param changes */ },
  destroy() { /* cleanup */ },
  resize(w, h) { /* handle resize */ },
};

export default mySketch;
```

Then register it in `src/sketches/registry.ts`:

```typescript
import mySketch from "./my-sketch";
sketchRegistry["my-sketch"] = mySketch;
```

## Creating Presets

Export your current configuration as JSON via Settings > Export JSON, or create manually:

```json
{
  "name": "My Preset",
  "description": "Custom configuration",
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
      "notes": "Speaker notes here"
    }
  ]
}
```

## Architecture Decisions

- **No reveal.js**: Custom slide system for full control over transitions and layering
- **Canvas 2D only**: No WebGL/Three.js dependency — works everywhere, smaller bundle
- **useReducer over Redux**: Minimal state management, sufficient for single-page presentation
- **All sketches are modules**: Standardized interface makes it easy to add new animations
- **Auto-save with versioning**: Invalidates stale saves on schema changes

## License

MIT License. See [LICENSE](LICENSE) for details.

---

Built by [Hans Lin / Group.G](https://github.com/hansai-art)
