import { useContext } from "react";
import { EngineContext } from "@/components/engine/state/engine-context";

export function useEngine() {
  const ctx = useContext(EngineContext);
  if (!ctx) throw new Error("useEngine must be used within EngineProvider");
  return ctx;
}
