/**
 * Basic WebGL utility for GPU-accelerated sketch rendering.
 * Raw WebGL helpers (no Three.js dependency).
 */

export interface WebGLSketchContext {
  gl: WebGLRenderingContext;
  canvas: HTMLCanvasElement;
  createShader(type: number, source: string): WebGLShader | null;
  createProgram(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ): WebGLProgram | null;
  clear(): void;
}

export function initWebGL(
  canvas: HTMLCanvasElement
): WebGLSketchContext | null {
  const glRaw =
    canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  if (!glRaw) return null;

  const gl = glRaw as WebGLRenderingContext;

  return {
    gl,
    canvas,

    createShader(type: number, source: string): WebGLShader | null {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn("WebGL shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    },

    createProgram(
      vertexShader: WebGLShader,
      fragmentShader: WebGLShader
    ): WebGLProgram | null {
      const program = gl.createProgram();
      if (!program) return null;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.warn(
          "WebGL program link error:",
          gl.getProgramInfoLog(program)
        );
        gl.deleteProgram(program);
        return null;
      }
      return program;
    },

    clear() {
      gl.clear(gl.COLOR_BUFFER_BIT);
    },
  };
}
