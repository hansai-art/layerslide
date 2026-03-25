import { useEffect, useRef } from "react";
import type { EngineState } from "@/components/engine/state/engine-reducer";
import type { BackgroundConfig, SlideConfig } from "@/types/layerslide";

const STORAGE_KEY = "ls-auto-save";
const DEBOUNCE_MS = 1000;

interface AutoSaveData {
  slides: SlideConfig[];
  background: BackgroundConfig;
}

/**
 * Auto-saves slides and background to localStorage with 1s debounce.
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
          slides: state.slides,
          background: state.background,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // Silently ignore storage errors (quota exceeded, etc.)
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [state.slides, state.background]);
}

/**
 * Load previously auto-saved state from localStorage.
 * Returns null if no saved state exists or if parsing fails.
 */
export function loadAutoSave(): AutoSaveData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as AutoSaveData;
    if (data && Array.isArray(data.slides) && data.background) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}
