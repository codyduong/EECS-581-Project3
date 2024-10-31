/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file This code is compiled and executed in the "lobby" place on the client
 *
 * In this particular case this is used for instantiating two GUIs
 * - PlayerHeadGui is the GUI above any one player's head and lives in 3D space
 * - ScreenGui is the overall experience GUI which lives in 2D space.
 *
 * GUIs are built using {@link https://github.com/Roblox/react-lua | react-lua}
 */

import React, { StrictMode } from "@rbxts/react";
import { createRoot } from "@rbxts/react-roblox";
import PlayersContext from "shared/client/gui/contexts/PlayersContext";
import PlayerHeadGui from "shared/client/gui/playerhead";
import ScreenGui from "shared/client/gui/screen";
import PlayerDataContext from "shared/client/gui/contexts/PlayerDataContext";
import DebugLobby from "./gui/DebugLobby";

let root = createRoot(new Instance("Folder"));
root.render(
  <StrictMode>
    <PlayersContext>
      <PlayerDataContext>
        <PlayerHeadGui />
        <ScreenGui>
          <DebugLobby />
        </ScreenGui>
      </PlayerDataContext>
    </PlayersContext>
  </StrictMode>,
);
