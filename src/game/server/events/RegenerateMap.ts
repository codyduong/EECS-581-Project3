/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Sets up asynchronous communication to regenerate the game map
 *
 * @see {@link https://create.roblox.com/docs/reference/engine/classes/RemoteEvent RemoteEvent | Documentation - Roblox Creator Hub}
 */

import { gameInfoEvent, regenerateMap } from "game/modules/events";
import { assertServer } from "shared/modules/utils";
import { WaveFunctionCollapseActor } from "game/server/wfc/wfc";
import { players } from "shared/server/events/PlayersEvent";
import gameInfo from "./GameInfo";
import { serializeGameInfo } from "game/modules/events/GameInfoEvent/GameInfoEvent";
import Guard from "shared/modules/guard/Guard";

let hasSetup = false;
/**
 * @throws if setup more than once
 */
export function setupRegenerateMap(): void {
  assertServer();
  assert(hasSetup === false);
  hasSetup = true;

  regenerateMap.OnServerEvent.Connect((player, maybeBool) => {
    let addVote = Guard.Boolean(maybeBool);

    const userId = player.UserId;
    const existing = gameInfo.restartVotes.findIndex((id) => userId === id);

    if (addVote === true && existing === -1) {
      gameInfo.restartVotes.push(userId);
    }
    if (addVote === false && existing !== -1) {
      gameInfo.restartVotes.remove(userId);
    }

    if (gameInfo.restartVotes.size() === players.size()) {
      WaveFunctionCollapseActor.SendMessage("RegenerateMap");
    }
  });

  game.GetService("Players").PlayerRemoving.Connect((player: Player) => {
    const index = gameInfo.restartVotes.findIndex((id) => id === player.UserId);

    if (index !== -1) {
      gameInfo.restartVotes.remove(index);
    }

    gameInfoEvent.FireAllClients(serializeGameInfo(gameInfo));
  });
}
