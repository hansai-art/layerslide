import { useState, useEffect, useRef } from "react";
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

/** Typewriter component: reveals text character by character */
function TypewriterText({ html, speed = 30 }: { html: string; speed?: number }) {
  const [displayLength, setDisplayLength] = useState(0);
  const plainText = useRef(html.replace(/<[^>]+>/g, ""));
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    plainText.current = html.replace(/<[^>]+>/g, "");
    setDisplayLength(0);

    intervalRef.current = setInterval(() => {
      setDisplayLength((prev) => {
        if (prev >= plainText.current.length) {
          clearInterval(intervalRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, speed);

    return () => clearInterval(intervalRef.current);
  }, [html, speed]);

  // Build visible HTML by counting visible chars
  const visibleHtml = getVisibleHtml(html, displayLength);
  const cursor = displayLength < plainText.current.length ? "▌" : "";

  return (
    <span dangerouslySetInnerHTML={{ __html: visibleHtml + cursor }} />
  );
}

/** Truncate HTML to show only `maxChars` visible characters */
function getVisibleHtml(html: string, maxChars: number): string {
  let visible = 0;
  let result = "";
  let inTag = false;

  for (let i = 0; i < html.length; i++) {
    const ch = html[i];
    if (ch === "<") {
      inTag = true;
      result += ch;
    } else if (ch === ">") {
      inTag = false;
      result += ch;
    } else if (inTag) {
      result += ch;
    } else {
      if (visible < maxChars) {
        result += ch;
        visible++;
      }
    }
  }
  return result;
}

/** Layer 2: Real-time editable text overlay */
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
              overlay.animation !== "typewriter"
                ? (animationClasses[overlay.animation] ?? "")
                : ""
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
            >
              {overlay.animation === "typewriter" ? (
                <TypewriterText html={overlay.text} />
              ) : (
                <span dangerouslySetInnerHTML={{ __html: overlay.text }} />
              )}
            </div>
          </div>
        ))}
    </div>
  );
};

export default OverlayLayer;
