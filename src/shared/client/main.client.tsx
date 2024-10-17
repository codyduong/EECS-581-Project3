import React, { StrictMode } from "@rbxts/react";
import { createRoot } from "@rbxts/react-roblox";
import PlayersContext from "shared/client/gui/contexts/PlayersContext";
import PlayerHeadGui from "shared/client/gui/playerhead";
import ScreenGui from "shared/client/gui/screen";
import PlayerDataContext from "./gui/contexts/PlayerDataContext";

const root = createRoot(new Instance("Folder"));
root.render(
  <StrictMode>
    <PlayersContext>
      <PlayerDataContext>
        <PlayerHeadGui />
        <ScreenGui />
      </PlayerDataContext>
    </PlayersContext>
  </StrictMode>,
);
