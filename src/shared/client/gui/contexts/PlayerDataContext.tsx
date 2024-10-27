/**
 * @author Cody Duong <cody.qd@gmail.com
 * @file 
 * 
 * PlayersDataContext provides {@link PlayerData} information
 *
 * - From a technical level, due to Roblox's client/server boundary seperation, we connect to a shared event in
 *   {@link playerDataEvent}, which the server will load a cached version of PlayerData into, and we will consume here
 *   in this context
 */

import React, { createContext, useContext, useEffect, useState } from "@rbxts/react";
import { PlayerData } from "shared/modules/database/PlayerData";
import { playerDataEvent } from "shared/modules/events";

const PlayerDataContextActual = createContext<PlayerData>(undefined!);

interface PlayerDataContextProps {
  children: React.ReactNode;
}

function PlayerDataContext({ children }: PlayerDataContextProps): JSX.Element | undefined {
  const [data, setData] = useState<PlayerData>(undefined!);

  useEffect(() => {
    const event = playerDataEvent.OnClientEvent.Connect((data) => {
      setData(data);
    });
    return () => {
      event.Disconnect();
    };
  }, []);

  if (data === undefined) {
    playerDataEvent.FireServer(undefined!); // we use undefined! since the server doesn't need data
    // TODO @codyduong add error boundary to display something while we wait
    // ie. a loading screen?
    return undefined;
  }

  return <PlayerDataContextActual.Provider value={data}>{children}</PlayerDataContextActual.Provider>;
}

export function usePlayerData(): PlayerData {
  const players = useContext(PlayerDataContextActual);
  return players;
}

export default PlayerDataContext;
