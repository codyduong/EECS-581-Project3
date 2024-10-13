import React, { createContext, useContext, useState } from "@rbxts/react";
import { findFirstSibling } from "shared/utils";

const PlayersC = createContext<Player[]>([]);

export const remoteEvent = findFirstSibling(script, "PlayersContextRemoteEvent") as RemoteEvent<
  (userIds: number[]) => void
>;

interface PlayersContextProps {
  children: React.ReactNode;
}

export default function PlayersContext({ children }: PlayersContextProps): JSX.Element {
  const [players, setPlayers] = useState<Player[]>([]);

  remoteEvent.OnClientEvent.Connect((userIds) => {
    const players = userIds.map((userId) => game.GetService("Players").GetPlayerByUserId(userId)).filterUndefined();
    players.forEach((player) => {
      // we have to manually manage events to make sure these changes propogate downstream
      // https://create.roblox.com/docs/reference/engine/classes/Player#events
      // add as needed
      player.CharacterAdded.Connect((character) => {
        setPlayers((prev) =>
          prev.map((p) => {
            if (player.UserId === p.UserId) {
              p.Character = character;
            }
            return p;
          }),
        );
      });
      player.CharacterRemoving.Connect((_character) => {
        setPlayers((prev) =>
          prev.map((p) => {
            if (player.UserId === p.UserId) {
              p.Character = undefined;
            }
            return p;
          }),
        );
      });
    });
    setPlayers(players);
  });

  return <PlayersC.Provider value={players}>{children}</PlayersC.Provider>;
}

export function usePlayers(): Player[] {
  const players = useContext(PlayersC);
  return players;
}
