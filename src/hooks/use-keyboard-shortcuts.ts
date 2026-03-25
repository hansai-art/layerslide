import { useEffect } from "react";

export interface ShortcutDef {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  label: string;
  action: () => void;
  /** If true, don't trigger when typing in inputs. Default: true */
  ignoreInputs?: boolean;
}

export function useKeyboardShortcuts(shortcuts: ShortcutDef[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;

      for (const shortcut of shortcuts) {
        const ignoreInputs = shortcut.ignoreInputs ?? true;
        if (ignoreInputs && (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT")) {
          continue;
        }

        const ctrlRequired = shortcut.ctrl ?? false;
        const shiftRequired = shortcut.shift ?? false;
        const ctrlPressed = e.ctrlKey || e.metaKey;

        if (
          e.key === shortcut.key &&
          ctrlPressed === ctrlRequired &&
          e.shiftKey === shiftRequired
        ) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}
