/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file PlayersDataContext provides information about the current game state
 */

import React, { createContext, useContext, useEffect, useState } from "@rbxts/react";
import { gameInfoEvent } from "game/modules/events";
import { defaultGamesInfo, GameInfo } from "game/modules/events/GameInfoEvent/GameInfoEvent";
import { Tower } from "game/modules/towers/Tower";

const GameContextActual = createContext<GameInfo>(defaultGamesInfo);

interface GameContextProps {
  children: React.ReactNode;
}

export default function GameContext(props: GameContextProps): JSX.Element {
  const { children } = props;

  const [gameInfo, setGameInfo] = useState<GameInfo>(defaultGamesInfo);

  const events: RBXScriptConnection[] = [];
  useEffect(() => {
    events.push(
      gameInfoEvent.OnClientEvent.Connect((info) => {
        print("received", info);

        const mergedTowers = info.towers.map((props) => {
          let tower = Tower.fromGuid(props.guid);
          if (!tower) {
            tower = new Tower({ ...props, ephermal: false });
          }
          // TODO parent this better
          tower.model.Parent = game.Workspace;
          return tower;
        });

        // remove old towers
        print(gameInfo.towers);
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
