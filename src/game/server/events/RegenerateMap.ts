/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Sets up asynchronous communication to regenerate the game map
 *
 * @see {@link https://create.roblox.com/docs/reference/engine/classes/RemoteEvent RemoteEvent | Documentation - Roblox Creator Hub}
 */

import { regenerateMap } from "game/modules/events";
import { assertServer } from "shared/modules/utils";
import { WaveFunctionCollapseActor } from "game/server/wfc/wfc";

let hasSetup = false;
/**
 * @throws if setup more than once
 */
export function setupRegenerateMap(): void {
  assertServer();
  assert(hasSetup === false);
  hasSetup = true;

  const players: number[] = [];
  const playersVoted: number[] = [];

  regenerateMap.OnServerEvent.Connect((player, rest) => {
    let addVote: undefined | boolean = undefined;
    if (typeOf(rest) === "boolean") {
      addVote = rest as boolean;
    }

    const userId = player.UserId;
    const existing = playersVoted.findIndex((id) => userId === id);

    if (addVote === true && existing === -1) {
      playersVoted.push(userId);
    }
    if (addVote === false && existing !== -1) {
      playersVoted.remove(userId);
    }

    print(playersVoted, players);

    if (playersVoted.size() === players.size()) {
      WaveFunctionCollapseActor.SendMessage("RegenerateMap");
    }
  });

  game.GetService("Players").PlayerAdded.Connect((player: Player) => {
    print(`Player [id: ${player.UserId}, name: ${player.Name}] joined`);
    players.push(player.UserId);
  });

  game.GetService("Players").PlayerRemoving.Connect((player: Player) => {
    print(`Player [id: ${player.UserId}, name: ${player.Name}] left`);
    const playerId = players.findIndex((id) => player.UserId === id);
    if (playerId !== -1) players.remove(playerId);
  });
}
