/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file PlayersDataContext provides information about the current game state
 */

import React, { createContext, useContext, useEffect, useState } from "@rbxts/react";
import { requestTower } from "game/modules/events";
import { Tower } from "game/modules/Tower";

export type GameInfo = {
  towers: unknown[];
}

const GameContextActual = createContext<GameInfo>(undefined!);

interface GameContextProps {}

export default function GameContext (_props: GameContextProps): JSX.Element {
  const [towers, setTowers] = useState<Tower[]>([]);

  const events: RBXScriptConnection[] = []
  useEffect(() => {
    events.push(requestTower.OnClientEvent.Connect((props, action) => {
      switch (action) {
        case "buy":
          setTowers((prev) => [...prev, new Tower(props)])
        case "sell":
          setTowers((prev) => prev.filter((t) => t.guid !== props.guid))
        default:
          error("Unknown action sent to client")
      }
    }))
  }, [])


  return <GameContextActual.Provider value={{towers: towers}}></GameContextActual.Provider>
}

export function useGame(): GameInfo {
  return useContext(GameContextActual);
}