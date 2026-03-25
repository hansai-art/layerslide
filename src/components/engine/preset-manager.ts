import type { PresetConfig, BackgroundConfig, SlideConfig } from "@/types/layerslide";
import type { EngineState } from "./state/engine-reducer";

// Built-in presets (loaded statically)
import demoDefault from "@/presets/demo-default.json";
import demoMinimal from "@/presets/demo-minimal.json";

const builtInPresets: PresetConfig[] = [
  demoDefault as PresetConfig,
  demoMinimal as PresetConfig,
];

export function getBuiltInPresets(): PresetConfig[] {
  return builtInPresets;
}

export function getPresetByName(name: string): PresetConfig | undefined {
  return builtInPresets.find((p) => p.name === name);
}

/** Export current engine state as a preset JSON */
export function exportPreset(state: EngineState, name: string, description?: string): PresetConfig {
  return {
    name,
    description,
    background: state.background,
    slides: state.slides,
  };
}

/** Export preset as downloadable JSON file */
export function downloadPreset(preset: PresetConfig) {
  const json = JSON.stringify(preset, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${preset.name.replace(/\s+/g, "-")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Parse uploaded JSON file as preset */
export async function parsePresetFile(file: File): Promise<PresetConfig> {
  const text = await file.text();
  const data = JSON.parse(text);
  if (!data.name || !data.background || !data.slides) {
    throw new Error("Invalid preset format");
  }
  return data as PresetConfig;
}
