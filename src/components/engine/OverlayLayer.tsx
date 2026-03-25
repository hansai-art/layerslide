import { useState, useEffect, useRef, useCallback } from "react";
import type { TextOverlay } from "@/types/layerslide";
import { useEngine } from "@/hooks/use-engine";
import { cn } from "@/lib/utils";

interface OverlayLayerProps {
  overlays: TextOverlay[];
  editMode?: boolean;
  onSelectOverlay?: (overlayId: string, rect: DOMRect) => void;
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

interface DragState {
  isDragging: boolean;
  overlayId: string | null;
  startMouseX: number;
  startMouseY: number;
  startPosX: number; // % position at drag start
  startPosY: number;
}

/** Layer 2: Real-time editable text overlay */
const OverlayLayer = ({ overlays, editMode = false, onSelectOverlay }: OverlayLayerProps) => {
  const { dispatch, state } = useEngine();
  const dragRef = useRef<DragState>({
    isDragging: false,
    overlayId: null,
    startMouseX: 0,
    startMouseY: 0,
    startPosX: 50,
    startPosY: 50,
  });
  const overlayRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [dragPos, setDragPos] = useState<{ id: string; x: number; y: number } | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, overlay: TextOverlay) => {
      if (!editMode) return;
      e.preventDefault();
      e.stopPropagation();

      // Determine starting position in %
      let startX = 50;
      let startY = 50;
      if (overlay.position === "custom" && overlay.customPosition) {
        startX = overlay.customPosition.x;
        startY = overlay.customPosition.y;
      } else {
        // Convert current rendered position to %
        const el = overlayRefs.current.get(overlay.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          startX = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
          startY = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
        }
      }

      dragRef.current = {
        isDragging: true,
        overlayId: overlay.id,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startPosX: startX,
        startPosY: startY,
      };
      setDragPos({ id: overlay.id, x: startX, y: startY });
    },
    [editMode]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag.isDragging || !drag.overlayId) return;

      const deltaXPercent =
        ((e.clientX - drag.startMouseX) / window.innerWidth) * 100;
      const deltaYPercent =
        ((e.clientY - drag.startMouseY) / window.innerHeight) * 100;

      const newX = Math.max(0, Math.min(100, drag.startPosX + deltaXPercent));
      const newY = Math.max(0, Math.min(100, drag.startPosY + deltaYPercent));

      setDragPos({ id: drag.overlayId, x: newX, y: newY });
    },
    []
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag.isDragging || !drag.overlayId) return;

      const deltaXPercent =
        ((e.clientX - drag.startMouseX) / window.innerWidth) * 100;
      const deltaYPercent =
        ((e.clientY - drag.startMouseY) / window.innerHeight) * 100;

      const newX = Math.max(0, Math.min(100, drag.startPosX + deltaXPercent));
      const newY = Math.max(0, Math.min(100, drag.startPosY + deltaYPercent));

      // Only dispatch if actually moved
      const didMove =
        Math.abs(e.clientX - drag.startMouseX) > 3 ||
        Math.abs(e.clientY - drag.startMouseY) > 3;

      if (didMove) {
        dispatch({
          type: "UPDATE_OVERLAY",
          slideIndex: state.currentSlide,
          overlayId: drag.overlayId,
          updates: {
            position: "custom",
            customPosition: { x: newX, y: newY },
          },
        });
      }

      // If it was a click (not drag), select the overlay
      if (!didMove && onSelectOverlay) {
        const el = overlayRefs.current.get(drag.overlayId);
        if (el) {
          onSelectOverlay(drag.overlayId, el.getBoundingClientRect());
        }
      }

      dragRef.current = {
        isDragging: false,
        overlayId: null,
        startMouseX: 0,
        startMouseY: 0,
        startPosX: 50,
        startPosY: 50,
      };
      setDragPos(null);
    },
    [dispatch, state.currentSlide, onSelectOverlay]
  );

  // Attach global mouse listeners for drag
  useEffect(() => {
    if (!editMode) return;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [editMode, handleMouseMove, handleMouseUp]);

  /** Get position style for an overlay, accounting for active drag */
  const getPositionStyle = (
    overlay: TextOverlay
  ): React.CSSProperties | undefined => {
    // If this overlay is being dragged, use drag position
    if (dragPos && dragPos.id === overlay.id) {
      return {
        position: "absolute",
        left: `${dragPos.x}%`,
        top: `${dragPos.y}%`,
        transform: "translate(-50%, -50%)",
      };
    }
    // Normal custom position
    if (overlay.position === "custom" && overlay.customPosition) {
      return {
        position: "absolute",
        left: `${overlay.customPosition.x}%`,
        top: `${overlay.customPosition.y}%`,
        transform: "translate(-50%, -50%)",
      };
    }
    return undefined;
  };

  /** Get position classes, suppressed when dragging */
  const getPositionClasses = (overlay: TextOverlay): string => {
    if (dragPos && dragPos.id === overlay.id) return "";
    if (overlay.position === "custom" && overlay.customPosition) return "";
    return positionClasses[overlay.position] ?? "items-center";
  };

  return (
    <div
      id="ls-overlay"
      className={cn(
        "fixed inset-0",
        editMode ? "pointer-events-auto" : "pointer-events-none"
      )}
      style={{ zIndex: 2 }}
    >
      {overlays
        .filter((o) => o.visible)
        .map((overlay) => (
          <div
            key={overlay.id}
            ref={(el) => {
              if (el) overlayRefs.current.set(overlay.id, el);
              else overlayRefs.current.delete(overlay.id);
            }}
            className={cn(
              "absolute inset-0 flex justify-center px-8",
              getPositionClasses(overlay),
              overlay.animation !== "typewriter"
                ? (animationClasses[overlay.animation] ?? "")
                : ""
            )}
            style={getPositionStyle(overlay)}
          >
            <div
              className={cn(
                "max-w-4xl text-center",
                editMode
                  ? "pointer-events-auto cursor-move border border-dashed border-white/30 rounded-lg hover:border-white/60"
                  : "pointer-events-auto"
              )}
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
              onMouseDown={(e) => handleMouseDown(e, overlay)}
            >
              {(overlay.type === "image" && overlay.imageSrc) ? (
                <img
                  src={overlay.imageSrc}
                  alt=""
                  draggable={false}
                  style={{
                    width: overlay.imageWidth ? `${overlay.imageWidth}px` : "auto",
                    height: overlay.imageHeight ? `${overlay.imageHeight}px` : "auto",
                    maxWidth: "90vw",
                    maxHeight: "70vh",
                    objectFit: "contain",
                    opacity: overlay.imageOpacity ?? 1,
                    borderRadius: overlay.imageBorderRadius ? `${overlay.imageBorderRadius}px` : undefined,
                  }}
                />
              ) : overlay.animation === "typewriter" ? (
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
