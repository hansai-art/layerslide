import type { CSSProperties, ReactNode } from "react";
import type { TransitionType } from "@/types/layerslide";

export type { TransitionType };

/**
 * Returns inline CSSProperties for the given transition type.
 * `isActive` controls whether the slide is in its "entered" or "exited" state.
 */
export function getTransitionStyle(
  isActive: boolean,
  type: TransitionType = "fade"
): CSSProperties {
  const base: CSSProperties = {
    position: "absolute" as const,
    inset: 0,
    pointerEvents: isActive ? "auto" : "none",
  };

  switch (type) {
    case "none":
      return {
        ...base,
        opacity: isActive ? 1 : 0,
      };

    case "fade":
      return {
        ...base,
        opacity: isActive ? 1 : 0,
        transition: "opacity 500ms ease-in-out",
      };

    case "slide-left":
      return {
        ...base,
        opacity: isActive ? 1 : 0,
        transform: isActive ? "translateX(0)" : "translateX(100%)",
        transition: "transform 500ms ease-in-out, opacity 300ms ease-in-out",
      };

    case "slide-up":
      return {
        ...base,
        opacity: isActive ? 1 : 0,
        transform: isActive ? "translateY(0)" : "translateY(100%)",
        transition: "transform 500ms ease-in-out, opacity 300ms ease-in-out",
      };

    case "zoom":
      return {
        ...base,
        opacity: isActive ? 1 : 0,
        transform: isActive ? "scale(1)" : "scale(0.8)",
        transition: "transform 500ms ease-out, opacity 400ms ease-in-out",
      };

    default:
      return {
        ...base,
        opacity: isActive ? 1 : 0,
        transition: "opacity 500ms ease-in-out",
      };
  }
}

interface SlideTransitionProps {
  isActive: boolean;
  type?: TransitionType;
  children: ReactNode;
}

/**
 * Wrapper component that applies a transition effect to its children
 * based on the active state and chosen transition type.
 */
const SlideTransition = ({
  isActive,
  type = "fade",
  children,
}: SlideTransitionProps) => {
  const style = getTransitionStyle(isActive, type);

  return (
    <div
      className="flex items-center justify-center"
      style={style}
    >
      {children}
    </div>
  );
};

export default SlideTransition;
