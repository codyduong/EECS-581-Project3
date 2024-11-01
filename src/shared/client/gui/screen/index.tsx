import React from "@rbxts/react";
import { createPortal } from "@rbxts/react-roblox";
import Screen, { ScreenProps } from "./Screen";

export default function ScreenGui(props: ScreenProps): JSX.Element {
  const screenGui = script.FindFirstChild("ScreenGui")?.Clone() as ScreenGui;
  const localPlayer = game.GetService("Players").LocalPlayer;
  screenGui.Parent = localPlayer.FindFirstChild("PlayerGui");

  return createPortal(<Screen {...props} />, screenGui);
}
