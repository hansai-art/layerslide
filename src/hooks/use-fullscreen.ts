import { useState, useEffect, useCallback } from "react";

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enter = useCallback(() => {
    const el = document.getElementById("ls-engine") ?? document.documentElement;
    el.requestFullscreen?.();
  }, []);

  const exit = useCallback(() => {
    document.exitFullscreen?.();
  }, []);

  const toggle = useCallback(() => {
    if (isFullscreen) {
      exit();
    } else {
      enter();
    }
  }, [isFullscreen, enter, exit]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  return { isFullscreen, enter, exit, toggle };
}
