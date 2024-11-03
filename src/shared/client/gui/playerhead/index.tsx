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
function getHead(character: Model | undefined): MeshPart | undefined {
  return character?.GetChildren().find((child): child is MeshPart => child.Name === "Head" && child.IsA("MeshPart"));
}

/**
 * Function component for PlayerHeadGui
 * @param {undefined} _props Does not support any props
 * @returns {JSX.Element}
 */
export default function PlayerHeadGui(_props: unknown): JSX.Element {
  const players = usePlayers();

  return (
    <>
      {players.map((player) =>
        createPortal(
          <billboardgui
            Active
            Adornee={getHead(player.Character)}
            Size={new UDim2(0, 200, 0, 50)}
            StudsOffset={new Vector3(0, 4, 0)}
          >
            <PlayerHead />
          </billboardgui>,
          game.GetService("Players").LocalPlayer.FindFirstChild("PlayerGui")!,
          `${player.UserId}`,
        ),
      )}
    </>
  );
}
