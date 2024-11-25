/**
 * @prologue
 * @author Cody Duong <cody.qd@gmail.com>
 * @file PlayersDataContext provides UI information about the current game state.
 *
 * @precondition N/A
 * @postcondition N/A
 * @invariant N/A
 *
 * @sideeffect Adds towers to the client. @todo this should not be in the GUI code... ideally we have some custom
 * hook that runs and does this seperately for better MVC seperation.
 *
 * @throws Any DOM error occurs in the React tree
 *
 * @revisions
 * [2024.October.27]{@revision Initial creation to support gui in the game}
 * [2024.November.4]{@revision Add tower placement context}
 * [2024.November.11]{@revision Add tower upgrading for client display}
 * [2024.November.24]{@revision Improve prologue and inline comments (no logical changes)}
 */

import React, { createContext, useContext, useEffect, useState } from "@rbxts/react";
import { gameInfoEvent } from "game/modules/events";
import { GameInfo } from "game/modules/events/GameInfoEvent/GameInfoEvent";
import { Tower } from "game/modules/tower/Tower";
import Guard from "shared/modules/guard/Guard";

export const defaultGamesInfo = {
  towers: [],
  coins: {},
  wave: 0,
  waveStartVotes: [],
  timeUntilWaveStart: -1,
  restartVotes: [],
} as const satisfies GameInfo;

const GameContextActual = createContext<GameInfo>(defaultGamesInfo);

interface GameContextProps {
  children: React.ReactNode;
}

export default function GameContext(props: GameContextProps): JSX.Element {
  const { children } = props;

  const [gameInfo, setGameInfo] = useState<GameInfo>(defaultGamesInfo);

  useEffect(() => {
    const events: RBXScriptConnection[] = [];
    events.push(
      gameInfoEvent.OnClientEvent.Connect((info) => {
        // todo here, this should be a custom hook, rather than a useEffect here? Or is it fine since it is a context...
        // w/e -codyduong 2024, Nov 24
        const mergedTowers = info.towers.map((props) => {
          let tower = Tower.fromGuid(props.guid);
          if (!tower) {
            tower = new Tower({ ...props, ephermal: false });
          }
          while (tower.level !== props.level) {
            tower.upgrade();
          }

          const towerFolder = Guard.NonNil(game.Workspace.FindFirstChild("TowerFolder"));
          assert(classIs(towerFolder, "Folder"));
          const towerActor = Guard.NonNil(towerFolder.FindFirstChild(props.guid));
          assert(classIs(towerActor, "Actor"));
          tower.model.Parent = towerActor;
          return tower;
        });

        // remove old towers
        gameInfo.towers.forEach((oldTower) => {
          if (info.towers.findIndex((newTower) => newTower.guid === oldTower.guid) === -1) {
            oldTower.Destroy();
          }
        });

        setGameInfo({
          towers: mergedTowers,
          coins: info.coins,
          wave: info.wave,
          waveStartVotes: info.waveStartVotes,
          timeUntilWaveStart: info.timeUntilWaveStart,
          restartVotes: info.restartVotes,
        });
      }),
    );
    return () => {
      events.forEach((event) => event.Disconnect());
    };
  }, [gameInfo]);

  return <GameContextActual.Provider value={gameInfo}>{children}</GameContextActual.Provider>;
}

export function useGame(): GameInfo {
  return useContext(GameContextActual);
}
