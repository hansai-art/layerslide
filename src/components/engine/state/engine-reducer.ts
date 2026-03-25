import type { BackgroundConfig, TextOverlay, SlideConfig } from "@/types/layerslide";

// ===== Engine State =====

export interface EngineState {
  currentSlide: number;
  slides: SlideConfig[];
  background: BackgroundConfig;
  panelOpen: boolean;
  isPresenting: boolean;
  fps: number;
  autoDegrade: boolean;
}

// ===== Actions =====

export type EngineAction =
  | { type: "SET_SLIDE"; index: number }
  | { type: "NEXT_SLIDE" }
  | { type: "PREV_SLIDE" }
  | { type: "TOGGLE_PANEL" }
  | { type: "SET_PANEL_OPEN"; open: boolean }
  | { type: "SET_BACKGROUND"; config: BackgroundConfig }
  | { type: "UPDATE_BACKGROUND_PARAM"; key: string; value: unknown }
  | { type: "SET_BACKGROUND_OPACITY"; opacity: number }
  | { type: "SET_BACKGROUND_BLUR"; blur: number }
  | { type: "SET_SKETCH"; sketch: string }
  | { type: "UPDATE_OVERLAY"; slideIndex: number; overlayId: string; updates: Partial<TextOverlay> }
  | { type: "ADD_OVERLAY"; slideIndex: number; overlay: TextOverlay }
  | { type: "REMOVE_OVERLAY"; slideIndex: number; overlayId: string }
  | { type: "SET_OVERLAY_VISIBILITY"; slideIndex: number; overlayId: string; visible: boolean }
  | { type: "LOAD_PRESET"; slides: SlideConfig[]; background: BackgroundConfig }
  | { type: "SET_FPS"; fps: number }
  | { type: "SET_AUTO_DEGRADE"; enabled: boolean }
  | { type: "SET_PRESENTING"; presenting: boolean };

export function createInitialState(
  slides: SlideConfig[],
  background: BackgroundConfig
): EngineState {
  return {
    currentSlide: 0,
    slides,
    background,
    panelOpen: false,
    isPresenting: true,
    fps: 60,
    autoDegrade: true,
  };
}

export function engineReducer(state: EngineState, action: EngineAction): EngineState {
  switch (action.type) {
    case "SET_SLIDE":
      return { ...state, currentSlide: Math.max(0, Math.min(action.index, state.slides.length - 1)) };

    case "NEXT_SLIDE":
      return { ...state, currentSlide: Math.min(state.currentSlide + 1, state.slides.length - 1) };

    case "PREV_SLIDE":
      return { ...state, currentSlide: Math.max(state.currentSlide - 1, 0) };

    case "TOGGLE_PANEL":
      return { ...state, panelOpen: !state.panelOpen };

    case "SET_PANEL_OPEN":
      return { ...state, panelOpen: action.open };

    case "SET_BACKGROUND":
      return { ...state, background: action.config };

    case "UPDATE_BACKGROUND_PARAM":
      return {
        ...state,
        background: {
          ...state.background,
          params: { ...state.background.params, [action.key]: action.value },
        },
      };

    case "SET_BACKGROUND_OPACITY":
      return { ...state, background: { ...state.background, opacity: action.opacity } };

    case "SET_BACKGROUND_BLUR":
      return { ...state, background: { ...state.background, blur: action.blur } };

    case "SET_SKETCH":
      return {
        ...state,
        background: { ...state.background, type: "generator", sketch: action.sketch },
      };

    case "UPDATE_OVERLAY": {
      const slides = state.slides.map((slide, i) => {
        if (i !== action.slideIndex) return slide;
        return {
          ...slide,
          overlays: slide.overlays.map((o) =>
            o.id === action.overlayId ? { ...o, ...action.updates } : o
          ),
        };
      });
      return { ...state, slides };
    }

    case "ADD_OVERLAY": {
      const slides = state.slides.map((slide, i) => {
        if (i !== action.slideIndex) return slide;
        return { ...slide, overlays: [...slide.overlays, action.overlay] };
      });
      return { ...state, slides };
    }

    case "REMOVE_OVERLAY": {
      const slides = state.slides.map((slide, i) => {
        if (i !== action.slideIndex) return slide;
        return {
          ...slide,
          overlays: slide.overlays.filter((o) => o.id !== action.overlayId),
        };
      });
      return { ...state, slides };
    }

    case "SET_OVERLAY_VISIBILITY": {
      const slides = state.slides.map((slide, i) => {
        if (i !== action.slideIndex) return slide;
        return {
          ...slide,
          overlays: slide.overlays.map((o) =>
            o.id === action.overlayId ? { ...o, visible: action.visible } : o
          ),
        };
      });
      return { ...state, slides };
    }

    case "LOAD_PRESET":
      return {
        ...state,
        slides: action.slides,
        background: action.background,
        currentSlide: 0,
      };

    case "SET_FPS":
      return { ...state, fps: action.fps };

    case "SET_AUTO_DEGRADE":
      return { ...state, autoDegrade: action.enabled };

    case "SET_PRESENTING":
      return { ...state, isPresenting: action.presenting };

    default:
      return state;
  }
}
