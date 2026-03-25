import type { TextOverlay } from "@/types/layerslide";
import { cn } from "@/lib/utils";

interface OverlayLayerProps {
  overlays: TextOverlay[];
}

const positionClasses: Record<string, string> = {
  top: "items-start pt-16",
  center: "items-center",
  bottom: "items-end pb-16",
};

const animationClasses: Record<string, string> = {
  fadeIn: "ls-fade-in",
  slideUp: "ls-fade-in",
  none: "",
};

/** Layer 2 — Real-time editable text overlay */
const OverlayLayer = ({ overlays }: OverlayLayerProps) => {
  return (
    <div
      id="ls-overlay"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 2 }}
    >
      {overlays
        .filter((o) => o.visible)
        .map((overlay) => (
          <div
            key={overlay.id}
            className={cn(
              "absolute inset-0 flex justify-center px-8",
              positionClasses[overlay.position] ?? "items-center",
              animationClasses[overlay.animation] ?? ""
            )}
            style={
              overlay.position === "custom" && overlay.customPosition
                ? {
                    position: "absolute",
                    left: `${overlay.customPosition.x}%`,
                    top: `${overlay.customPosition.y}%`,
                    transform: "translate(-50%, -50%)",
                  }
                : undefined
            }
          >
            <div
              className="max-w-4xl text-center pointer-events-auto"
              style={{
                fontSize: overlay.style?.fontSize ?? "2rem",
                fontFamily: overlay.style?.fontFamily,
                color: overlay.style?.color ?? "hsl(var(--foreground))",
                backgroundColor: overlay.style?.backgroundColor,
                textShadow:
                  overlay.style?.textShadow ??
                  "0 2px 20px rgba(0,0,0,0.6), 0 0 40px rgba(0,0,0,0.3)",
                padding: overlay.style?.padding ?? "1rem 2rem",
                borderRadius: "var(--radius)",
              }}
              dangerouslySetInnerHTML={{ __html: overlay.text }}
            />
          </div>
        ))}
    </div>
  );
};

export default OverlayLayer;
