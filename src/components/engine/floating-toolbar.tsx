import { useState, useCallback, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Plus,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import type { TextOverlay } from "@/types/layerslide";
import { useEngine } from "@/hooks/use-engine";
import { cn } from "@/lib/utils";

interface FloatingToolbarProps {
  overlay: TextOverlay;
  slideIndex: number;
  position: { x: number; y: number };
  onClose: () => void;
}

const PRESET_COLORS = [
  { label: "白", value: "hsl(210, 20%, 92%)" },
  { label: "青", value: "hsl(180, 80%, 50%)" },
  { label: "紫", value: "hsl(260, 60%, 55%)" },
  { label: "黃", value: "hsl(45, 90%, 60%)" },
  { label: "綠", value: "hsl(140, 70%, 50%)" },
  { label: "紅", value: "hsl(0, 72%, 55%)" },
  { label: "藍", value: "hsl(220, 80%, 60%)" },
  { label: "橙", value: "hsl(25, 90%, 55%)" },
];

const FONT_STEP = 0.2;

function parseFontSize(fontSize?: string): number {
  if (!fontSize) return 2;
  const val = parseFloat(fontSize);
  return isNaN(val) ? 2 : val;
}

/** Toggle an HTML tag wrapping the full text content */
function toggleTag(html: string, tag: string): string {
  const openTag = `<${tag}>`;
  const closeTag = `</${tag}>`;
  // Check if already wrapped
  const trimmed = html.trim();
  if (trimmed.startsWith(openTag) && trimmed.endsWith(closeTag)) {
    // Remove the outermost tag
    return trimmed.slice(openTag.length, trimmed.length - closeTag.length);
  }
  return `${openTag}${html}${closeTag}`;
}

/** Check if text is wrapped with a tag */
function hasTag(html: string, tag: string): boolean {
  const trimmed = html.trim();
  return trimmed.startsWith(`<${tag}>`) && trimmed.endsWith(`</${tag}>`);
}

/** Set text-align on the content by wrapping in a div */
function setAlignment(html: string, align: string): string {
  // Remove existing alignment wrapper
  const unwrapped = html.replace(
    /^<div style="text-align:\s*\w+;">([\s\S]*)<\/div>$/,
    "$1"
  );
  if (align === "left") return unwrapped; // left is default, no wrapper needed
  return `<div style="text-align: ${align};">${unwrapped}</div>`;
}

/** Detect current alignment from html */
function getAlignment(html: string): string {
  const match = html.match(/^<div style="text-align:\s*(\w+);">/);
  return match ? match[1] : "left";
}

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "p-1.5 rounded-lg transition-colors hover:bg-white/10",
        active && "bg-white/20 text-white"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-6 bg-white/15 mx-1" />;
}

const FloatingToolbar = ({
  overlay,
  slideIndex,
  position,
  onClose,
}: FloatingToolbarProps) => {
  const { dispatch } = useEngine();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const currentColor = overlay.style?.color ?? "hsl(210, 20%, 92%)";
  const currentFontSize = parseFontSize(overlay.style?.fontSize);
  const currentAlign = getAlignment(overlay.text);

  // Close toolbar on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const updateOverlay = useCallback(
    (updates: Partial<TextOverlay>) => {
      dispatch({
        type: "UPDATE_OVERLAY",
        slideIndex,
        overlayId: overlay.id,
        updates,
      });
    },
    [dispatch, slideIndex, overlay.id]
  );

  const handleToggleTag = useCallback(
    (tag: string) => {
      updateOverlay({ text: toggleTag(overlay.text, tag) });
    },
    [overlay.text, updateOverlay]
  );

  const handleAlignment = useCallback(
    (align: string) => {
      updateOverlay({ text: setAlignment(overlay.text, align) });
    },
    [overlay.text, updateOverlay]
  );

  const handleFontSizeChange = useCallback(
    (delta: number) => {
      const newSize = Math.max(0.4, currentFontSize + delta);
      updateOverlay({
        style: {
          ...overlay.style,
          fontSize: `${newSize.toFixed(1)}rem`,
        },
      });
    },
    [currentFontSize, overlay.style, updateOverlay]
  );

  const handleColorChange = useCallback(
    (color: string) => {
      updateOverlay({
        style: { ...overlay.style, color },
      });
      setShowColorPicker(false);
    },
    [overlay.style, updateOverlay]
  );

  const handleToggleVisibility = useCallback(() => {
    dispatch({
      type: "SET_OVERLAY_VISIBILITY",
      slideIndex,
      overlayId: overlay.id,
      visible: !overlay.visible,
    });
  }, [dispatch, slideIndex, overlay.id, overlay.visible]);

  const handleDelete = useCallback(() => {
    dispatch({
      type: "REMOVE_OVERLAY",
      slideIndex,
      overlayId: overlay.id,
    });
    onClose();
  }, [dispatch, slideIndex, overlay.id, onClose]);

  // Position toolbar above the element, clamped to viewport
  const toolbarStyle: React.CSSProperties = {
    position: "fixed",
    left: `${position.x}px`,
    top: `${Math.max(8, position.y - 56)}px`,
    transform: "translateX(-50%)",
    zIndex: 8,
  };

  return (
    <div ref={toolbarRef} style={toolbarStyle}>
      <div className="bg-ls-surface-1 border border-border rounded-xl shadow-2xl shadow-black/30 backdrop-blur-md px-2 py-1.5 flex items-center gap-0.5 text-sm text-foreground">
        {/* Group 1: Text formatting */}
        <ToolbarButton
          active={hasTag(overlay.text, "strong")}
          onClick={() => handleToggleTag("strong")}
          title="粗體"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          active={hasTag(overlay.text, "em")}
          onClick={() => handleToggleTag("em")}
          title="斜體"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          active={hasTag(overlay.text, "u")}
          onClick={() => handleToggleTag("u")}
          title="底線"
        >
          <Underline className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Group 2: Alignment */}
        <ToolbarButton
          active={currentAlign === "left"}
          onClick={() => handleAlignment("left")}
          title="靠左對齊"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          active={currentAlign === "center"}
          onClick={() => handleAlignment("center")}
          title="置中對齊"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          active={currentAlign === "right"}
          onClick={() => handleAlignment("right")}
          title="靠右對齊"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Group 3: Font size */}
        <ToolbarButton
          onClick={() => handleFontSizeChange(-FONT_STEP)}
          title="縮小字體"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>
        <span className="px-1.5 text-xs font-mono tabular-nums min-w-[3.5rem] text-center select-none">
          {currentFontSize.toFixed(1)}rem
        </span>
        <ToolbarButton
          onClick={() => handleFontSizeChange(FONT_STEP)}
          title="放大字體"
        >
          <Plus className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Group 4: Color */}
        <div className="relative">
          <ToolbarButton
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="文字顏色"
          >
            <div
              className="w-4 h-4 rounded-full border border-white/30"
              style={{ backgroundColor: currentColor }}
            />
          </ToolbarButton>

          {showColorPicker && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-ls-surface-1 border border-border rounded-lg shadow-2xl shadow-black/40 p-2 grid grid-cols-4 gap-1.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  onClick={() => handleColorChange(c.value)}
                  className={cn(
                    "w-7 h-7 rounded-full border-2 transition-transform hover:scale-110",
                    currentColor === c.value
                      ? "border-white"
                      : "border-transparent"
                  )}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          )}
        </div>

        <Divider />

        {/* Group 5: Actions */}
        <ToolbarButton
          onClick={handleToggleVisibility}
          title={overlay.visible ? "隱藏" : "顯示"}
        >
          {overlay.visible ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
        </ToolbarButton>
        <ToolbarButton onClick={handleDelete} title="刪除文字覆蓋">
          <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
        </ToolbarButton>
      </div>
    </div>
  );
};

export default FloatingToolbar;
