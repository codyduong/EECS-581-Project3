/**
 * @author Cody Duong <cody.qd@gmail.com>
 */

import React from "@rbxts/react";
import { useGame } from "./contexts/GameContext";

interface CoinsProps {}

export default function Coins(_props: CoinsProps): JSX.Element {
  const gameInfo = useGame();

  return (
    <textlabel
      Size={new UDim2(0, 100, 0, 50)}
      Position={new UDim2(0.5, -50, 0, 0)}
      Text={`Coins: ${gameInfo.coins[`${game.GetService("Players").LocalPlayer.UserId}`]}`}
    />
  );
}
