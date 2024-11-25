/**
 * @prologue
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Shows information about coins
 *
 * @precondition N/A
 * @postcondition N/A
 * @invariant N/A
 * @sideeffect N/A
 *
 * @throws Any DOM error occurs in the React tree
 *
 * @revisions
 * [2024.October.27]{@revision Initial creation to support displaying coins}
 * [2024.November.11]{@revision Wrap in frame for better sibling DOM hierarchy}
 * [2024.November.24]{@revision Improve prologue and inline comments (no logical changes)}
 */

import React from "@rbxts/react";
import { useGame } from "./contexts/GameContext";

interface CoinsProps {}

export default function Coins(_props: CoinsProps): JSX.Element {
  const gameInfo = useGame();

  const frameSize = new UDim2(0, 200, 0, 50);
  const labelSize = new UDim2(0, 100, 0, 50);

  return (
    <frame Size={frameSize} Position={new UDim2(0.5, -frameSize.X.Offset / 2, 0, 0)}>
      <textlabel
        Size={labelSize}
        Position={new UDim2(0, 0, 0, 0)}
        Text={`Coins: ${gameInfo.coins[`${game.GetService("Players").LocalPlayer.UserId}`]}`}
      />
      <textlabel Size={labelSize} Position={new UDim2(0.0, labelSize.X.Offset, 0, 0)} Text={`Wave: ${gameInfo.wave}`} />
    </frame>
  );
}
