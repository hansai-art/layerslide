// ===== Background Layer Types =====

export type BackgroundType = "video" | "canvas" | "iframe" | "generator" | "image";
export type AnimationEngine = "p5" | "canvas" | "three" | "shader";

export interface BackgroundConfig {
  type: BackgroundType;
  src?: string;
  engine?: AnimationEngine;
  sketch?: string;
  params?: Record<string, unknown>;
  opacity?: number;
  blur?: number;
  overlayColor?: string;
}

// ===== Sketch System Types =====

export interface SketchParamDef {
  type: "number" | "color" | "boolean" | "select" | "vector2";
  label: string;
  default: unknown;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}

export interface SketchModule {
  name: string;
  defaultParams: Record<string, SketchParamDef>;
  setup: (canvas: HTMLCanvasElement, params: Record<string, unknown>) => void;
  draw: (ctx: CanvasRenderingContext2D, time: number, params: Record<string, unknown>) => void;
  updateParams: (params: Record<string, unknown>) => void;
  destroy: () => void;
  resize?: (w: number, h: number) => void;
  onMouse?: (x: number, y: number, type: string) => void;
}

// ===== Overlay Layer Types =====

export type OverlayPosition = "top" | "center" | "bottom" | "custom";
export type OverlayAnimation = "fadeIn" | "slideUp" | "typewriter" | "none";

export type OverlayType = "text" | "image";

export interface TextOverlay {
  id: string;
  type?: OverlayType; // default "text" for backwards compat
  text: string;
  position: OverlayPosition;
  animation: OverlayAnimation;
  style?: {
    fontSize?: string;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    textShadow?: string;
    padding?: string;
  };
  // Image-specific fields
  imageSrc?: string;
  imageWidth?: number;  // px
  imageHeight?: number; // px
  imageOpacity?: number; // 0-1
  imageBorderRadius?: number; // px
  customPosition?: { x: number; y: number };
  visible: boolean;
  // Animation timing
  delay?: number;    // ms before animation starts (default 0)
  duration?: number;  // ms animation duration (default 500)
}

// ===== Slide Types =====

export interface SlideConfig {
  id: string;
  content?: string; // HTML content for reveal.js section
  overlays: TextOverlay[];
  background?: BackgroundConfig; // per-slide background override
  notes?: string;
}

// ===== Preset Types =====

export interface PresetConfig {
  name: string;
  description?: string;
  background: BackgroundConfig;
  slides: SlideConfig[];
  transitions?: Record<string, BackgroundConfig>;
}

// ===== Control Panel Types =====

export type ControlPanelTab = "background" | "text" | "navigation" | "animation" | "settings";

export interface ControlPanelState {
  isOpen: boolean;
  activeTab: ControlPanelTab;
}

// ===== Transition Types =====

export type TransitionType = "fade" | "slide-left" | "slide-up" | "zoom" | "none";

// ===== Engine State =====

export interface LayerSlideState {
  currentSlide: number;
  totalSlides: number;
  background: BackgroundConfig;
  overlays: TextOverlay[];
  controlPanel: ControlPanelState;
  isPresenting: boolean;
  preset: PresetConfig | null;
  transition?: TransitionType;
}
