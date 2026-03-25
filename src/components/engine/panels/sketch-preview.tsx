/** Visual preview thumbnails for each sketch using CSS effects */

interface SketchVisual {
  bg: string;
  overlay?: string;
  dots?: { x: string; y: string; size: string; color: string }[];
  lines?: boolean;
}

const visuals: Record<string, SketchVisual> = {
  "particle-network": {
    bg: "linear-gradient(135deg, #0d1a18 0%, #0a1412 100%)",
    dots: [
      { x: "20%", y: "30%", size: "3px", color: "#00d2be" },
      { x: "50%", y: "20%", size: "2px", color: "#00d2be" },
      { x: "75%", y: "50%", size: "3px", color: "#00d2be" },
      { x: "35%", y: "65%", size: "2px", color: "#00d2be" },
      { x: "60%", y: "75%", size: "2px", color: "#00d2be" },
      { x: "85%", y: "25%", size: "2px", color: "#00d2be" },
    ],
    lines: true,
  },
  starfield: {
    bg: "radial-gradient(ellipse at center, #0d0d1a 0%, #060608 100%)",
    dots: [
      { x: "15%", y: "20%", size: "2px", color: "#fff" },
      { x: "40%", y: "15%", size: "1px", color: "#dde" },
      { x: "65%", y: "35%", size: "2px", color: "#fff" },
      { x: "80%", y: "60%", size: "1px", color: "#ccf" },
      { x: "30%", y: "70%", size: "2px", color: "#fff" },
      { x: "55%", y: "50%", size: "1px", color: "#eef" },
      { x: "90%", y: "20%", size: "1px", color: "#ddf" },
      { x: "10%", y: "80%", size: "2px", color: "#fff" },
    ],
  },
  "wave-gradient": {
    bg: "linear-gradient(180deg, #0a0c12 0%, #00382e 40%, #1a0a3a 70%, #0a0c12 100%)",
    overlay: "linear-gradient(180deg, transparent 0%, rgba(0,210,190,0.15) 50%, rgba(130,100,255,0.1) 80%, transparent 100%)",
  },
  "bokeh-lights": {
    bg: "radial-gradient(ellipse at 30% 40%, rgba(130,100,255,0.25) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(0,210,190,0.2) 0%, transparent 40%), radial-gradient(ellipse at 50% 30%, rgba(255,100,200,0.15) 0%, transparent 45%), #0a0c12",
  },
  "matrix-rain": {
    bg: "linear-gradient(180deg, #0a0c12 0%, #001a08 50%, #0a0c12 100%)",
    overlay: "repeating-linear-gradient(180deg, transparent 0px, transparent 4px, rgba(0,255,70,0.08) 4px, rgba(0,255,70,0.08) 5px)",
    dots: [
      { x: "20%", y: "30%", size: "2px", color: "#00ff46" },
      { x: "40%", y: "50%", size: "2px", color: "#00ff46" },
      { x: "60%", y: "20%", size: "2px", color: "#00ff46" },
      { x: "80%", y: "60%", size: "2px", color: "#00ff46" },
    ],
  },
  "noise-terrain": {
    bg: "linear-gradient(180deg, #0a0c12 0%, #0a1a1a 100%)",
    overlay: "repeating-linear-gradient(0deg, transparent 0px, transparent 8px, rgba(0,210,190,0.12) 8px, rgba(0,210,190,0.12) 9px)",
  },
  "geometric-morph": {
    bg: "radial-gradient(circle at 50% 50%, #1a0a20 0%, #0a0c12 100%)",
    overlay: "conic-gradient(from 0deg at 50% 50%, rgba(0,210,190,0.1) 0deg, rgba(130,100,255,0.15) 120deg, rgba(0,210,190,0.1) 240deg, rgba(130,100,255,0.15) 360deg)",
  },
  "fluid-sim": {
    bg: "radial-gradient(ellipse at 35% 45%, rgba(0,180,220,0.3) 0%, transparent 40%), radial-gradient(ellipse at 65% 55%, rgba(180,0,255,0.25) 0%, transparent 35%), #0a0c12",
  },
  "aurora-borealis": {
    bg: "linear-gradient(180deg, #0a0c12 0%, #0a0c12 30%, #0a2a18 60%, #0a1a10 80%, #0a0c12 100%)",
    overlay: "linear-gradient(180deg, transparent 0%, transparent 30%, rgba(100,255,150,0.15) 50%, rgba(80,200,255,0.1) 65%, rgba(180,100,255,0.08) 75%, transparent 100%)",
    dots: [
      { x: "15%", y: "10%", size: "1px", color: "#fff" },
      { x: "45%", y: "8%", size: "1px", color: "#ddf" },
      { x: "70%", y: "15%", size: "1px", color: "#fff" },
      { x: "85%", y: "5%", size: "1px", color: "#eef" },
    ],
  },
  "spiral-galaxy": {
    bg: "radial-gradient(ellipse at 50% 50%, rgba(255,240,200,0.2) 0%, rgba(200,180,255,0.1) 20%, rgba(100,120,200,0.05) 40%, #0a0c12 70%)",
    dots: [
      { x: "48%", y: "48%", size: "4px", color: "rgba(255,240,200,0.6)" },
      { x: "35%", y: "40%", size: "1px", color: "rgba(200,180,255,0.5)" },
      { x: "60%", y: "55%", size: "1px", color: "rgba(200,180,255,0.5)" },
      { x: "40%", y: "60%", size: "1px", color: "rgba(150,150,255,0.4)" },
      { x: "65%", y: "38%", size: "1px", color: "rgba(150,150,255,0.4)" },
    ],
  },
  "rain-ripples": {
    bg: "linear-gradient(180deg, #0a0c1a 0%, #0a1020 40%, #0d1428 100%)",
    dots: [
      { x: "30%", y: "65%", size: "8px", color: "rgba(100,150,255,0.15)" },
      { x: "65%", y: "75%", size: "12px", color: "rgba(100,150,255,0.1)" },
      { x: "50%", y: "55%", size: "6px", color: "rgba(100,150,255,0.12)" },
    ],
  },
  "shader-gradient": {
    bg: "linear-gradient(135deg, #2a0a30 0%, #0a1a2a 50%, #1a0a20 100%)",
    overlay: "linear-gradient(45deg, rgba(255,100,150,0.15) 0%, rgba(100,150,255,0.15) 50%, rgba(255,100,150,0.15) 100%)",
  },
};

interface SketchPreviewProps {
  sketchName: string;
  width?: number;
  height?: number;
}

const SketchPreview = ({ sketchName, width = 120, height = 68 }: SketchPreviewProps) => {
  const v = visuals[sketchName] ?? { bg: "#0a0c12" };

  return (
    <div
      className="rounded-md w-full relative overflow-hidden"
      style={{ height, background: v.bg }}
    >
      {v.overlay && (
        <div className="absolute inset-0" style={{ background: v.overlay }} />
      )}
      {v.dots?.map((dot, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: dot.x,
            top: dot.y,
            width: dot.size,
            height: dot.size,
            backgroundColor: dot.color,
            boxShadow: `0 0 ${parseInt(dot.size) * 2}px ${dot.color}`,
          }}
        />
      ))}
      {v.lines && (
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.3 }}>
          <line x1="20%" y1="30%" x2="50%" y2="20%" stroke="#00d2be" strokeWidth="0.5" />
          <line x1="50%" y1="20%" x2="75%" y2="50%" stroke="#00d2be" strokeWidth="0.5" />
          <line x1="75%" y1="50%" x2="60%" y2="75%" stroke="#00d2be" strokeWidth="0.5" />
          <line x1="35%" y1="65%" x2="20%" y2="30%" stroke="#00d2be" strokeWidth="0.5" />
          <line x1="35%" y1="65%" x2="60%" y2="75%" stroke="#00d2be" strokeWidth="0.5" />
          <line x1="85%" y1="25%" x2="75%" y2="50%" stroke="#00d2be" strokeWidth="0.5" />
        </svg>
      )}
    </div>
  );
};

export default SketchPreview;
