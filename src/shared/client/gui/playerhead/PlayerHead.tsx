import React from "@rbxts/react";
import Frame from "shared/client/gui/frame";

interface PlayerHeadProps {
  player: Player;
  children: React.ReactNode;
  initialCount?: number;
}

export default function PlayerHead({ player, children }: PlayerHeadProps): JSX.Element {
  return (
    <Frame Size={new UDim2(1, 0, 0, 100)}>
      <textlabel Size={new UDim2(1, 0, 0, 50)} Localize={false} Text={player.Name}></textlabel>
      {children}
    </Frame>
  );
}
