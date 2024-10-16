import React, { createContext, useContext, useEffect, useState } from "@rbxts/react";
import { findFirstSibling } from "shared/modules/utils";

const PlayersContextActual = createContext<Player[]>([]);

export const remoteEvent = findFirstSibling(script, "PlayersContextRemoteEvent") as RemoteEvent<
  (userIds: number[]) => void
>;

interface PlayersContextProps {
  children: React.ReactNode;
}

export default function PlayersContext({ children }: PlayersContextProps): JSX.Element {
  const [playersConn, setPlayersConn] = useState<
    {
      player: Player;
      connections: RBXScriptConnection[];
    }[]
  >([]);

  useEffect(() => {
    const event = remoteEvent.OnClientEvent.Connect((userIds) => {
      // print("event received: ", userIds);
      // print("current players: ", playersConn);

      const playersToAdd = userIds
        .filter((userId) => !playersConn.map(({ player }) => player.UserId).includes(userId))
        .map((userId) => game.GetService("Players").GetPlayerByUserId(userId))
        .filterUndefined();
      const playersToDelete = playersConn.filter(({ player }) => !userIds.includes(player.UserId));

      // destroy any connections to the player
      playersToDelete.forEach(({ connections }) => {
        connections.forEach((connection) => {
          connection.Disconnect();
        });
      });

      const playersToDeleteById = playersToDelete.map(({ player }) => player.UserId);
      // remove from players list
      const filteredPlayers = playersConn.filter(({ player }) => !playersToDeleteById.includes(player.UserId));

      setPlayersConn([
        ...filteredPlayers,
        ...playersToAdd.map((player) => ({
          player,
          connections: [
            player.CharacterAdded.Connect((character) => {
              setPlayersConn((prev) =>
                prev.map(({ player: p, connections }) => {
                  if (player.UserId === p.UserId) {
                    p.Character = character;
                  }
                  return {
                    player: p,
                    connections,
                  };
                }),
              );
            }),
            // Don't include this, creates infinite loop, due to overlap in
            // timing where a character can be added and removed
            // player.CharacterRemoving.Connect((_character) => {
            //   setPlayersConn((prev) =>
            //     prev.map(({ player: p, connections }) => {
            //       if (player.UserId === p.UserId) {
            //         p.Character = undefined;
            //       }
            //       return {
            //         player: p,
            //         connections,
            //       };
            //     }),
            //   );
            // }),
          ],
        })),
      ]);
    });
    return () => {
      event.Disconnect();
    };
  }, [playersConn]);

  return (
    <PlayersContextActual.Provider value={playersConn.map(({ player }) => player)}>
      {children}
    </PlayersContextActual.Provider>
  );
}

export function usePlayers(): Player[] {
  const players = useContext(PlayersContextActual);
  return players;
}
