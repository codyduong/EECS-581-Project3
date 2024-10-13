import React, { useEffect, useMemo, useState } from "@rbxts/react";
import { createPortal } from "@rbxts/react-roblox";
import PlayerHead from "./PlayerHead";
import { usePlayers } from "shared/contexts/PlayersContext";

function getHead(character: Model | undefined) {
  return character?.GetChildren().find((child): child is MeshPart => child.Name === "Head" && child.IsA("MeshPart"));
}

export default function PlayerHeadGui(_props: unknown): JSX.Element {
  const players = usePlayers();
  // const [billboards, setBillboards] = useState<{ player: Player; billboardGui: BillboardGui }[]>([]);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    print(players);
  }, [players]);

  const billboards = players
    .map((player) => {
      const playerGui = game.GetService("Players").LocalPlayer.FindFirstChild("PlayerGui");
      const billboardName = `PlayerHeadGui_${player.UserId}`;

      const oldBillboard = playerGui?.FindFirstChild(billboardName) as BillboardGui;
      const billboardGui = oldBillboard ?? (script.FindFirstChild("PlayerHeadGui")?.Clone() as BillboardGui);
      billboardGui.Name = billboardName;
      billboardGui.Parent = playerGui;

      const adornee = getHead(player?.Character);
      if (adornee) {
        billboardGui.Adornee = adornee;
      } else {
        billboardGui.Destroy();
        return undefined;
      }

      return {
        player,
        billboardGui,
      };
    })
    .filterUndefined();

  return (
    <>{billboards.map(({ player, billboardGui }) => createPortal(<PlayerHead />, billboardGui, `${player.UserId}`))}</>
  );
}
