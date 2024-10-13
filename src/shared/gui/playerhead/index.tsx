import React from "@rbxts/react";
import { createPortal } from "@rbxts/react-roblox";
import PlayerHead from "./PlayerHead";

export default function PlayerHeadGui(_props: unknown): JSX.Element {
  const billboardGui = script.FindFirstChild("PlayerHeadGui") as BillboardGui;
  const localPlayer = game.GetService("Players").LocalPlayer;
  billboardGui.Parent = localPlayer.FindFirstChild("PlayerGui");

  localPlayer.CharacterAdded.Connect((character) => {
    billboardGui.Adornee = character
      .GetChildren()
      .find((child): child is MeshPart => child.Name === "Head" && child.IsA("MeshPart"));
  });

  return createPortal(<PlayerHead />, billboardGui);
}
