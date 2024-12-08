/**
 * @prologue
 * @author Cody Duong <cody.qd@gmail.com>
 * @file This code is compiled and executed in the "game" place on the client
 *
 * In this particular case this is used for instantiating two GUIs
 * - {@link PlayerHeadGui} is the GUI above any one player's head and lives in 3D space
 * - {@link ScreenGui} is the overall experience GUI which lives in 2D space.
 *
 * GUIs are built using {@link https://github.com/Roblox/react-lua | react-lua}
 *
 * @precondition N/A
 * @postcondition N/A
 * @invariant N/A
 *
 * @sideeffect Creates a folder for the React tree to mount into
 *
 * @throws Any DOM error occurs in the React tree
 *
 * @revisions
 * [2024.October.27]{@revision Initial creation for game GUI}
 * [2024.November.4]{@revision Add wave GUI}
 * [2024.November.24]{@revision Improve prologue and inline comments (no logical changes)}
 */

import React, { StrictMode } from "@rbxts/react";
import { createRoot } from "@rbxts/react-roblox";
import PlayersContext from "shared/client/gui/contexts/PlayersContext";
import ScreenGui from "shared/client/gui/screen";
import PlayerDataContext from "shared/client/gui/contexts/PlayerDataContext";
// import DebugGame from "./gui/DebugGame";
// import PlayerHeadGui from "shared/client/gui/playerhead";
import Coins from "./gui/Coins";
import GameContext from "./gui/contexts/GameContext";
import TowerSelect from "./gui/TowerSelect";
import WaveStartButton from "./gui/WaveStartButton";
import UIContext from "shared/client/gui/contexts/UIContext";

let root = createRoot(new Instance("Folder"));
root.render(
  <StrictMode>
    <PlayersContext>
      <PlayerDataContext>
        <UIContext>
          {/* Game specific contexts */}
          <GameContext>
            {/* <PlayerHeadGui /> */}
            <ScreenGui>
              {/* <DebugGame /> */}
              <TowerSelect />
              <Coins />
              <WaveStartButton />
            </ScreenGui>
          </GameContext>
        </UIContext>
      </PlayerDataContext>
    </PlayersContext>
  </StrictMode>,
);
