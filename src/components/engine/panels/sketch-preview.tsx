/** Static color preview for each sketch (no canvas animation to avoid singleton conflicts) */

const sketchColors: Record<string, { bg: string; accent: string }> = {
  "particle-network": { bg: "linear-gradient(135deg, #0a0c12, #0d2420)", accent: "#00d2be" },
  starfield: { bg: "linear-gradient(135deg, #0a0c12, #0d0d1a)", accent: "#c8dcff" },
  "wave-gradient": { bg: "linear-gradient(135deg, #0a1a1a, #1a0a2a)", accent: "#00d2be" },
  "bokeh-lights": { bg: "linear-gradient(135deg, #0a0c12, #1a1020)", accent: "#8266ff" },
  "matrix-rain": { bg: "linear-gradient(135deg, #0a0c12, #001a0a)", accent: "#00ff46" },
  "noise-terrain": { bg: "linear-gradient(135deg, #0a0c12, #0a1a1a)", accent: "#00d2be" },
  "geometric-morph": { bg: "linear-gradient(135deg, #0a0c12, #1a0a20)", accent: "#8266ff" },
  "fluid-sim": { bg: "linear-gradient(135deg, #0a1020, #200a2a)", accent: "#00b4dc" },
  "aurora-borealis": { bg: "linear-gradient(135deg, #0a0c12, #0a1a10)", accent: "#64ff96" },
  "spiral-galaxy": { bg: "linear-gradient(135deg, #0a0c12, #100a1a)", accent: "#c8b4ff" },
  "rain-ripples": { bg: "linear-gradient(135deg, #0a0c1a, #0a1020)", accent: "#6496ff" },
  "shader-gradient": { bg: "linear-gradient(135deg, #1a0a20, #0a1a2a)", accent: "#ff6496" },
};

interface SketchPreviewProps {
  sketchName: string;
  width?: number;
  height?: number;
}

const SketchPreview = ({ sketchName, width = 120, height = 68 }: SketchPreviewProps) => {
  const colors = sketchColors[sketchName] ?? { bg: "linear-gradient(135deg, #0a0c12, #1a1a2a)", accent: "#00d2be" };

  return (
    <div
      className="rounded-md w-full relative overflow-hidden"
      style={{
        height,
        background: colors.bg,
      }}
    >
      {/* Decorative accent dots/lines to hint at the animation style */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(circle at 30% 60%, ${colors.accent}22 0%, transparent 50%), radial-gradient(circle at 70% 40%, ${colors.accent}18 0%, transparent 40%)`,
        }}
      />
      <div
        className="absolute bottom-1 left-1 w-2 h-2 rounded-full"
        style={{ backgroundColor: colors.accent, opacity: 0.6 }}
      />
    </div>
  );
};

export default SketchPreview;
