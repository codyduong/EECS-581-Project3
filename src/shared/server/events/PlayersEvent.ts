/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Sets up asynchronous communication about {@link Player}'s between client and server using {@link RemoteEvent}
 *
 * @see {@link https://create.roblox.com/docs/reference/engine/classes/RemoteEvent RemoteEvent | Documentation - Roblox Creator Hub}
 */

import { playersEvent } from "shared/modules/events";
import { assertServer } from "shared/modules/utils";

let hasSetup = false;
/**
 * @throws if setup more than once
 */
export function setupPlayersEvent(): void {
  assertServer();
  assert(hasSetup === false);
  hasSetup = true;

  const players: number[] = [];

  game.GetService("Players").PlayerAdded.Connect((player: Player) => {
    print(`Player [id: ${player.UserId}, name: ${player.Name}] joined`);
    players.push(player.UserId);
    playersEvent.FireAllClients(players);
  });

  game.GetService("Players").PlayerRemoving.Connect((player: Player) => {
    print(`Player [id: ${player.UserId}, name: ${player.Name}] left`);
    const playerId = players.findIndex((id) => player.UserId === id);
    if (playerId !== -1) players.remove(playerId);
    playersEvent.FireAllClients(players);
  });
}
