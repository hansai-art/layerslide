import { useEffect } from "react";

/** Calls onVisible/onHidden when the page visibility changes */
export function useVisibilityPause(onHidden: () => void, onVisible: () => void) {
  useEffect(() => {
    const handler = () => {
      if (document.hidden) {
        onHidden();
      } else {
        onVisible();
      }
    };

    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [onHidden, onVisible]);
}
