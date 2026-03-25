import type { BackgroundConfig, TextOverlay, SlideConfig, TransitionType } from "@/types/layerslide";

// ===== Engine State =====

export interface EngineState {
  currentSlide: number;
  slides: SlideConfig[];
  background: BackgroundConfig;
  transition: TransitionType;
  panelOpen: boolean;
  isPresenting: boolean;
  fps: number;
  autoDegrade: boolean;
  history: EngineState[];
  future: EngineState[];
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
  | { type: "SET_PRESENTING"; presenting: boolean }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "ADD_SLIDE"; afterIndex?: number }
  | { type: "DELETE_SLIDE"; index: number }
  | { type: "DUPLICATE_SLIDE"; index: number }
  | { type: "REORDER_SLIDE"; from: number; to: number }
  | { type: "UPDATE_SLIDE_NOTES"; slideIndex: number; notes: string }
  | { type: "SET_TRANSITION"; transition: TransitionType };

const MAX_HISTORY = 50;

/** Actions that should NOT be recorded in undo history */
const EPHEMERAL_ACTIONS = new Set([
  "SET_FPS",
  "SET_PRESENTING",
  "TOGGLE_PANEL",
  "SET_PANEL_OPEN",
]);

export function createInitialState(
  slides: SlideConfig[],
  background: BackgroundConfig
): EngineState {
  return {
    currentSlide: 0,
    slides,
    background,
    transition: "fade",
    panelOpen: false,
    isPresenting: true,
    fps: 60,
    autoDegrade: true,
    history: [],
    future: [],
  };
}

/** Strip history/future from a state snapshot to avoid deep nesting */
function stateSnapshot(state: EngineState): EngineState {
  return { ...state, history: [], future: [] };
}

function engineReducer(state: EngineState, action: EngineAction): EngineState {
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

    // ===== Slide CRUD =====

    case "ADD_SLIDE": {
      const insertAfter = action.afterIndex ?? state.currentSlide;
      const newSlide: SlideConfig = {
        id: `slide-${Date.now()}`,
        overlays: [
          {
            id: `overlay-${Date.now()}`,
            text: "New Slide",
            position: "center",
            animation: "fadeIn",
            visible: true,
          },
        ],
      };
      const newSlides = [...state.slides];
      newSlides.splice(insertAfter + 1, 0, newSlide);
      return { ...state, slides: newSlides, currentSlide: insertAfter + 1 };
    }

    case "DELETE_SLIDE": {
      if (state.slides.length <= 1) return state;
      const newSlides = state.slides.filter((_, i) => i !== action.index);
      let newCurrent = state.currentSlide;
      if (state.currentSlide >= newSlides.length) {
        newCurrent = newSlides.length - 1;
      } else if (state.currentSlide > action.index) {
        newCurrent = state.currentSlide - 1;
      }
      return { ...state, slides: newSlides, currentSlide: newCurrent };
    }

    case "DUPLICATE_SLIDE": {
      const source = state.slides[action.index];
      if (!source) return state;
      const cloned: SlideConfig = structuredClone(source);
      cloned.id = `slide-${Date.now()}`;
      cloned.overlays = cloned.overlays.map((o) => ({
        ...o,
        id: `overlay-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      }));
      const newSlides = [...state.slides];
      newSlides.splice(action.index + 1, 0, cloned);
      return { ...state, slides: newSlides, currentSlide: action.index + 1 };
    }

    case "REORDER_SLIDE": {
      const { from, to } = action;
      if (from === to || from < 0 || to < 0 || from >= state.slides.length || to >= state.slides.length) {
        return state;
      }
      const newSlides = [...state.slides];
      const [moved] = newSlides.splice(from, 1);
      newSlides.splice(to, 0, moved);
      // Adjust currentSlide to follow the moved slide if it was the current one
      let newCurrent = state.currentSlide;
      if (state.currentSlide === from) {
        newCurrent = to;
      } else if (from < state.currentSlide && to >= state.currentSlide) {
        newCurrent = state.currentSlide - 1;
      } else if (from > state.currentSlide && to <= state.currentSlide) {
        newCurrent = state.currentSlide + 1;
      }
      return { ...state, slides: newSlides, currentSlide: newCurrent };
    }

    case "UPDATE_SLIDE_NOTES": {
      const slides = state.slides.map((slide, i) => {
        if (i !== action.slideIndex) return slide;
        return { ...slide, notes: action.notes };
      });
      return { ...state, slides };
    }

    case "SET_TRANSITION":
      return { ...state, transition: action.transition };

    default:
      return state;
  }
}

/** Wraps engineReducer with undo/redo support */
export function undoableReducer(state: EngineState, action: EngineAction): EngineState {
  switch (action.type) {
    case "UNDO": {
      if (state.history.length === 0) return state;
      const previous = state.history[state.history.length - 1];
      const newHistory = state.history.slice(0, -1);
      return {
        ...previous,
        history: newHistory,
        future: [stateSnapshot(state), ...state.future],
      };
    }

    case "REDO": {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        ...next,
        history: [...state.history, stateSnapshot(state)],
        future: newFuture,
      };
    }

    default: {
      const newState = engineReducer(state, action);
      if (newState === state) return state;

      // Ephemeral actions: don't record in history
      if (EPHEMERAL_ACTIONS.has(action.type)) {
        return { ...newState, history: state.history, future: state.future };
      }

      // Record in history, clear future
      const snapshot = stateSnapshot(state);
      const newHistory = [...state.history, snapshot].slice(-MAX_HISTORY);
      return { ...newState, history: newHistory, future: [] };
    }
  }
}

export { engineReducer };
