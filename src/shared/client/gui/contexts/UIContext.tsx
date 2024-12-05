import React, { createContext, useCallback, useContext, useState } from "@rbxts/react";

export type UIContext = {
  inUI: boolean;
  enterUI: () => void;
  exitUI: () => void;
};

export const defaultUIContext = {
  inUI: false,
  enterUI: () => {},
  exitUI: () => {},
} as const satisfies UIContext;

const UIContextActual = createContext<UIContext>(defaultUIContext);

interface UIContextProps {
  children: React.ReactNode;
}

export default function UIContext(props: UIContextProps): JSX.Element {
  const { children } = props;

  const [inUI, setInUI] = useState(false);

  const enterUI = useCallback(() => {
    setInUI(true);
  }, [setInUI]);

  const exitUI = useCallback(() => {
    setInUI(false);
  }, [setInUI]);

  return <UIContextActual.Provider value={{ inUI, enterUI, exitUI }}>{children}</UIContextActual.Provider>;
}

export function useUI(): UIContext {
  return useContext(UIContextActual);
}
