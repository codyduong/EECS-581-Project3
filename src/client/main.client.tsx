import React, { StrictMode } from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import PlayersContext from "shared/contexts/PlayersContext";
import PlayerHeadGui from "shared/gui/playerhead";
import ScreenGui from "shared/gui/screen";

const root = createRoot(new Instance("Folder"));
root.render(
  <StrictMode>
    <PlayersContext>
      <PlayerHeadGui />
      <ScreenGui />
    </PlayersContext>
  </StrictMode>,
);
