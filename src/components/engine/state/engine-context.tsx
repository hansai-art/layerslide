import { createContext, useReducer, type ReactNode, type Dispatch } from "react";
import {
  undoableReducer,
  createInitialState,
  type EngineState,
  type EngineAction,
} from "./engine-reducer";
import type { BackgroundConfig, SlideConfig } from "@/types/layerslide";

interface EngineContextValue {
  state: EngineState;
  dispatch: Dispatch<EngineAction>;
}

export const EngineContext = createContext<EngineContextValue | null>(null);

interface EngineProviderProps {
  children: ReactNode;
  slides: SlideConfig[];
  background: BackgroundConfig;
}

export const EngineProvider = ({ children, slides, background }: EngineProviderProps) => {
  const [state, dispatch] = useReducer(undoableReducer, createInitialState(slides, background));

  return (
    <EngineContext.Provider value={{ state, dispatch }}>
      {children}
    </EngineContext.Provider>
  );
};
