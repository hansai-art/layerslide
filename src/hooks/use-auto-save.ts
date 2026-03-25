import { useEffect, useRef } from "react";
import type { EngineState } from "@/components/engine/state/engine-reducer";
import type { BackgroundConfig, SlideConfig, TransitionType } from "@/types/layerslide";

const STORAGE_KEY = "ls-auto-save";
const SAVE_VERSION = 3; // Bump: added image overlays // Bump to invalidate old saves
const DEBOUNCE_MS = 1000;

interface AutoSaveData {
  version?: number;
  slides: SlideConfig[];
  background: BackgroundConfig;
  transition?: TransitionType;
}

/**
 * Auto-saves slides, background, and transition to localStorage with 1s debounce.
 */
export function useAutoSave(state: EngineState): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      try {
        const data: AutoSaveData = {
          version: SAVE_VERSION,
          slides: state.slides,
          background: state.background,
          transition: state.transition,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // Silently ignore storage errors
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [state.slides, state.background, state.transition]);
}

/**
 * Load previously auto-saved state from localStorage.
 */
export function loadAutoSave(): AutoSaveData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as AutoSaveData;
    if (data && Array.isArray(data.slides) && data.background && data.version === SAVE_VERSION) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}
