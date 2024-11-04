import { gameInfoEvent } from "game/modules/events";
import { GameInfo, serializeGameInfo } from "game/modules/events/GameInfoEvent/GameInfoEvent";
import { Tower } from "game/modules/towers/Tower";

const towers: Tower[] = [];
// a map of player id to player coins
const coins: Record<number, number> = {};

const gameInfo = {
  towers,
  coins,
  wave: 0,
  waveStartVotes: [] as number[],
  timeUntilWaveStart: -1,
} satisfies GameInfo;

let hasSetup = false;
/**
 * @throws if setup more than once
 */
export function setupGameInfo(): void {
  assert(hasSetup === false);
  hasSetup = true;

  game.GetService("Players").PlayerAdded.Connect((player) => {
    gameInfo.coins[player.UserId] = 10;

    gameInfoEvent.FireAllClients(serializeGameInfo(gameInfo));
  });

  game.GetService("Players").PlayerRemoving.Connect((player) => {
    // TODO? audit this usage? what if a player has the ability to rejoin, how do we trust the coins here?
    // coins[player.UserId] = undefined!

    const waveStartVote = gameInfo.waveStartVotes.findIndex((id) => id === player.UserId);

    let hasChanged = false;

    if (waveStartVote !== -1) {
      gameInfo.waveStartVotes.remove(waveStartVote);
      hasChanged = true;
    }

    if (hasChanged) {
      gameInfoEvent.FireAllClients(serializeGameInfo(gameInfo));
    }
  });
}

export default gameInfo;
