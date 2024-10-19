/**
 * Primary entry point for PlayerHeadGui
 *
 * - PlayerHeadGui is the GUI above any one player's head and lives in 3D space
 * - Every player generates a PlayerHeadGui for themselves and for all other players. It does this by cloning
 *   ./PlayerHeadGui.model.json, which is transformed into a {@link BillboardGui}. (See
 *   {@link https://rojo.space/docs/v6/sync-details/#json-models} for more info) Then it appropriately modfies
 *   properties to allow this to display above every players' heads.
 */

import React from "@rbxts/react";
import { createPortal } from "@rbxts/react-roblox";
import PlayerHead from "./PlayerHead";
import { usePlayers } from "shared/client/gui/contexts/PlayersContext";

/**
 * Utility function to return the head of a character.
 * @param {Model} [character] See {@link https://create.roblox.com/docs/characters Characters}
 * @returns {MeshPart} The character's head
 */
function getHead(character: Model | undefined) {
  return character?.GetChildren().find((child): child is MeshPart => child.Name === "Head" && child.IsA("MeshPart"));
}

/**
 * Function component for PlayerHeadGui
 * @param {undefined} _props Does not support any props
 * @returns {JSX.Element}
 */
export default function PlayerHeadGui(_props: unknown): JSX.Element {
  const players = usePlayers();
  const userIds = players.map((player) => player.UserId);

  const playerGui = game.GetService("Players").LocalPlayer.FindFirstChild("PlayerGui");

  const existingBillboards = playerGui
    ?.GetChildren()
    .filter(
      (child): child is BillboardGui =>
        child.Name.split("_")[0] === "PlayerHeadGui" && child.ClassName === "BillboardGui",
    );

  // cleanup billboards that no longer have a player
  existingBillboards?.forEach((billboard) => {
    const userId = billboard.GetAttribute("player") as number;
    if (!userIds.includes(userId)) {
      billboard.Destroy();
    }
  });

  // create or use existing billboards and point to player head
  const billboards = players
    .map((player) => {
      const billboardName = `PlayerHeadGui_${player.UserId}`;

      const oldBillboard = playerGui?.FindFirstChild(billboardName) as BillboardGui;
      const billboardGui = oldBillboard ?? (script.FindFirstChild("PlayerHeadGui")?.Clone() as BillboardGui);
      billboardGui.Name = billboardName;
      billboardGui.Parent = playerGui;
      billboardGui.SetAttribute("player", player.UserId);

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
