/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file PlayersDataContext provides information about the current game state
 */

import React, { createContext, useContext, useEffect, useState } from "@rbxts/react";
import { gameInfoEvent } from "game/modules/events";
import { Tower, TowerPropsSerializable } from "game/modules/Tower";

export type GameInfoSerializable = {
  towers: TowerPropsSerializable[];
  coins: number;
};

export type GameInfo = {
  towers: Tower[];
  coins: number; // this is the coins for this specific player.
};

const defaultGamesInfo = {
  towers: [],
  coins: 0,
} as const satisfies GameInfo;

const GameContextActual = createContext<GameInfo>(defaultGamesInfo);

interface GameContextProps {
  children: React.ReactNode;
}

export default function GameContext(props: GameContextProps): JSX.Element {
  const { children } = props;

  const [gameInfo, setGameInfo] = useState<GameInfo>(defaultGamesInfo);

  const events: RBXScriptConnection[] = [];
  useEffect(() => {
    // events.push(requestTower.OnClientEvent.Connect((props, action) => {
    //   switch (action) {
    //     case "buy":
    //       setTowers((prev) => [...prev, new Tower(props)])
    //     case "sell":
    //       setTowers((prev) => prev.filter((t) => t.guid !== props.guid))
    //     default:
    //       error("Unknown action sent to client")
    //   }
    // }))
    events.push(
      gameInfoEvent.OnClientEvent.Connect((info) => {
        setGameInfo({
          towers: info.towers.map((tprops) => new Tower(tprops)),
          coins: info.coins,
        });
      }),
    );
    return () => {
      events.forEach((event) => event.Disconnect());
    };
  }, []);

  return <GameContextActual.Provider value={gameInfo}>{children}</GameContextActual.Provider>;
}

export function useGame(): GameInfo {
  return useContext(GameContextActual);
}
