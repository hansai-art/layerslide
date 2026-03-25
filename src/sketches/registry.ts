import type { SketchModule } from "@/types/layerslide";
import particleNetwork from "./particle-network";
import starfield from "./starfield";
import waveGradient from "./wave-gradient";
import bokehLights from "./bokeh-lights";
import matrixRain from "./matrix-rain";
import noiseTerrain from "./noise-terrain";
import geometricMorph from "./geometric-morph";
import fluidSim from "./fluid-sim";
import auroraBorealis from "./aurora-borealis";
import spiralGalaxy from "./spiral-galaxy";
import rainRipples from "./rain-ripples";
import shaderGradient from "./shader-gradient";

const sketchRegistry: Record<string, SketchModule> = {
  "particle-network": particleNetwork,
  starfield: starfield,
  "wave-gradient": waveGradient,
  "bokeh-lights": bokehLights,
  "matrix-rain": matrixRain,
  "noise-terrain": noiseTerrain,
  "geometric-morph": geometricMorph,
  "fluid-sim": fluidSim,
  "aurora-borealis": auroraBorealis,
  "spiral-galaxy": spiralGalaxy,
  "rain-ripples": rainRipples,
  "shader-gradient": shaderGradient,
};

export function getSketch(name: string): SketchModule | undefined {
  return sketchRegistry[name];
}

export function getSketchNames(): string[] {
  return Object.keys(sketchRegistry);
}

export function getSketchList(): { name: string; label: string }[] {
  return Object.entries(sketchRegistry).map(([name, mod]) => ({
    name,
    label: mod.name,
  }));
}

export function registerSketch(name: string, module: SketchModule) {
  sketchRegistry[name] = module;
}

export default sketchRegistry;
