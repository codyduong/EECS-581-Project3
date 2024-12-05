import { gameInfoEvent } from "game/modules/events";
import { GameInfo, serializeGameInfo } from "game/modules/events/GameInfoEvent/GameInfoEvent";
import { Tower } from "game/modules/tower/Tower";

const COINS_INITIAL = 80;

const DEFAULT_GAME_INFO = {
  towers: [] as Tower[],
  coins: {} as Record<number, number>,
  wave: 0,
  waveStartVotes: [] as number[],
  /**
   * 0 indicates wave should be starting immediately (this changes to -2 right away)
   * -1 indicates wave is ready (and can be voted for)
   * -2 indicates wave is already running (and therefore we shouldn't start the next wave)
   */
  timeUntilWaveStart: -1,
  restartVotes: [] as number[],
} satisfies GameInfo;

const gameInfo = table.clone(DEFAULT_GAME_INFO);

export const resetGameInfo = (): void => {
  // this could probably be a pair loop, we have to do it manually since we can't export lets.
  gameInfo.towers.forEach((tower) => tower.Destroy());
  gameInfo.towers = [];
  for (const [key, _] of pairs(gameInfo.coins)) {
    gameInfo.coins[key] = COINS_INITIAL;
  }
  gameInfo.wave = 0;
  gameInfo.waveStartVotes = [];
  gameInfo.timeUntilWaveStart = -1;
  gameInfo.restartVotes = [];
};

let hasSetup = false;
/**
 * @throws if setup more than once
 */
export function setupGameInfo(): void {
  assert(hasSetup === false);
  hasSetup = true;

  game.GetService("Players").PlayerAdded.Connect((player) => {
    if (gameInfo.coins[player.UserId] === undefined) {
      gameInfo.coins[player.UserId] = COINS_INITIAL;
    }

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
