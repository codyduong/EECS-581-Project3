import React from "@rbxts/react";

export interface ScreenProps {
  children: React.ReactNode;
}

export default function Screen(props: ScreenProps): JSX.Element {
  const { children } = props;

  return <>{children}</>;
}
