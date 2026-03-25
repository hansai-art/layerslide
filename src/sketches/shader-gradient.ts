import type { SketchModule, SketchParamDef } from "@/types/layerslide";
import { initWebGL, type WebGLSketchContext } from "./webgl-renderer";

let w = 0;
let h = 0;
let webglCtx: WebGLSketchContext | null = null;
let program: WebGLProgram | null = null;
let uTime: WebGLUniformLocation | null = null;
let uResolution: WebGLUniformLocation | null = null;
let uColor1: WebGLUniformLocation | null = null;
let uColor2: WebGLUniformLocation | null = null;
let uSpeed: WebGLUniformLocation | null = null;
let uComplexity: WebGLUniformLocation | null = null;
let useWebGL = false;

// Offscreen canvas for WebGL rendering that gets drawn onto the 2D context
let offscreenCanvas: HTMLCanvasElement | null = null;

const defaultParams: Record<string, SketchParamDef> = {
  speed: {
    type: "number",
    label: "速度",
    default: 0.4,
    min: 0.05,
    max: 2,
    step: 0.05,
  },
  color1: { type: "color", label: "顏色 1", default: "60, 180, 255" },
  color2: { type: "color", label: "顏色 2", default: "255, 80, 160" },
  complexity: {
    type: "number",
    label: "複雜度",
    default: 4,
    min: 1,
    max: 10,
    step: 1,
  },
};

let currentParams: Record<string, unknown> = {};

const VERTEX_SRC = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SRC = `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform float u_speed;
uniform float u_complexity;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * u_speed;

  float wave = 0.0;
  for (float i = 1.0; i <= 10.0; i += 1.0) {
    if (i > u_complexity) break;
    wave += sin(uv.x * i * 2.0 + t * (0.5 + i * 0.3)) * cos(uv.y * i * 1.5 + t * (0.3 + i * 0.2)) / i;
  }
  wave = wave * 0.5 + 0.5;

  vec3 color = mix(u_color1 / 255.0, u_color2 / 255.0, wave);
  gl_FragColor = vec4(color, 1.0);
}
`;

function parseColor(c: unknown): [number, number, number] {
  if (typeof c === "string") {
    const parts = c.split(",").map((s) => parseFloat(s.trim()));
    if (parts.length >= 3) return [parts[0], parts[1], parts[2]];
  }
  return [128, 128, 255];
}

function initWebGLPipeline(canvas: HTMLCanvasElement): boolean {
  // Create an offscreen canvas for WebGL
  offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.width = canvas.width;
  offscreenCanvas.height = canvas.height;

  webglCtx = initWebGL(offscreenCanvas);
  if (!webglCtx) return false;

  const { gl } = webglCtx;
  const vs = webglCtx.createShader(gl.VERTEX_SHADER, VERTEX_SRC);
  const fs = webglCtx.createShader(gl.FRAGMENT_SHADER, FRAGMENT_SRC);
  if (!vs || !fs) return false;

  program = webglCtx.createProgram(vs, fs);
  if (!program) return false;

  gl.useProgram(program);

  // Full-screen quad
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );
  const aPos = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  uTime = gl.getUniformLocation(program, "u_time");
  uResolution = gl.getUniformLocation(program, "u_resolution");
  uColor1 = gl.getUniformLocation(program, "u_color1");
  uColor2 = gl.getUniformLocation(program, "u_color2");
  uSpeed = gl.getUniformLocation(program, "u_speed");
  uComplexity = gl.getUniformLocation(program, "u_complexity");

  gl.viewport(0, 0, offscreenCanvas.width, offscreenCanvas.height);
  gl.clearColor(0, 0, 0, 1);

  return true;
}

// Canvas 2D fallback
function drawFallback(
  ctx: CanvasRenderingContext2D,
  time: number,
  params: Record<string, unknown>
) {
  const speed = (params.speed as number) ?? 0.4;
  const c1 = parseColor(params.color1);
  const c2 = parseColor(params.color2);
  const complexity = (params.complexity as number) ?? 4;
  const t = time * speed * 0.001;

  const steps = 64;
  const stripH = Math.ceil(h / steps);

  for (let i = 0; i < steps; i++) {
    const y = i / steps;
    let wave = 0;
    for (let j = 1; j <= complexity; j++) {
      wave +=
        Math.sin(y * j * 2 + t * (0.5 + j * 0.3)) *
        Math.cos(0.5 * j * 1.5 + t * (0.3 + j * 0.2)) /
        j;
    }
    wave = wave * 0.5 + 0.5;

    const r = Math.round(c1[0] + (c2[0] - c1[0]) * wave);
    const g = Math.round(c1[1] + (c2[1] - c1[1]) * wave);
    const b = Math.round(c1[2] + (c2[2] - c1[2]) * wave);

    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, i * stripH, w, stripH + 1);
  }
}

const shaderGradient: SketchModule = {
  name: "shader-gradient",
  defaultParams,

  setup(canvas) {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    currentParams = {};

    // Try to init WebGL
    useWebGL = initWebGLPipeline(canvas);
  },

  draw(ctx, time, params) {
    const p = { ...defaultParams, ...params };
    const resolvedParams: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(p)) {
      resolvedParams[k] =
        typeof v === "object" && v !== null && "default" in v
          ? (v as { default: unknown }).default
          : v;
    }
    // Override with actual param values
    for (const [k, v] of Object.entries(params)) {
      resolvedParams[k] = v;
    }

    if (useWebGL && webglCtx && program && offscreenCanvas) {
      const { gl } = webglCtx;
      gl.useProgram(program);

      gl.uniform1f(uTime, time * 0.001);
      gl.uniform2f(uResolution, offscreenCanvas.width, offscreenCanvas.height);

      const c1 = parseColor(resolvedParams.color1);
      const c2 = parseColor(resolvedParams.color2);
      gl.uniform3f(uColor1, c1[0], c1[1], c1[2]);
      gl.uniform3f(uColor2, c2[0], c2[1], c2[2]);
      gl.uniform1f(uSpeed, (resolvedParams.speed as number) ?? 0.4);
      gl.uniform1f(uComplexity, (resolvedParams.complexity as number) ?? 4);

      webglCtx.clear();
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // Copy WebGL result to 2D canvas
      ctx.drawImage(offscreenCanvas, 0, 0, w, h);
    } else {
      drawFallback(ctx, time, resolvedParams);
    }
  },

  updateParams(params) {
    currentParams = { ...currentParams, ...params };
  },

  destroy() {
    if (webglCtx && program) {
      webglCtx.gl.deleteProgram(program);
    }
    webglCtx = null;
    program = null;
    offscreenCanvas = null;
    useWebGL = false;
    currentParams = {};
  },

  resize(newW, newH) {
    w = newW;
    h = newH;
    if (offscreenCanvas && webglCtx) {
      offscreenCanvas.width = newW;
      offscreenCanvas.height = newH;
      webglCtx.gl.viewport(0, 0, newW, newH);
    }
  },
};

export default shaderGradient;
