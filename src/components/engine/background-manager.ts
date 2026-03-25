import type { BackgroundConfig } from "@/types/layerslide";

export interface CrossfadeState {
  current: BackgroundConfig;
  next: BackgroundConfig | null;
  progress: number; // 0 = fully current, 1 = fully next
  transitioning: boolean;
  paused: boolean;
}

export function createCrossfadeState(config: BackgroundConfig): CrossfadeState {
  return {
    current: config,
    next: null,
    progress: 0,
    transitioning: false,
    paused: false,
  };
}

const CROSSFADE_DURATION = 1000; // ms

export function startCrossfade(
  state: CrossfadeState,
  nextConfig: BackgroundConfig
): CrossfadeState {
  return {
    ...state,
    next: nextConfig,
    progress: 0,
    transitioning: true,
  };
}

export function updateCrossfade(
  state: CrossfadeState,
  deltaMs: number
): CrossfadeState {
  if (!state.transitioning || !state.next) return state;

  const newProgress = state.progress + deltaMs / CROSSFADE_DURATION;

  if (newProgress >= 1) {
    return {
      current: state.next,
      next: null,
      progress: 0,
      transitioning: false,
      paused: state.paused,
    };
  }

  return { ...state, progress: newProgress };
}
