import { gameInfoEvent } from "game/modules/events";
import { GameInfo, serializeGameInfo } from "game/modules/events/GameInfoEvent/GameInfoEvent";
import { Tower } from "game/modules/tower/Tower";

const COINS_INITIAL = 80;

const DEFAULT_GAME_INFO = {
  towers: [] as Tower[],
  coins: {} as Record<number, number>,
  wave: 0,
  waveReady: new Instance("BoolValue"), //ready for next wave (ie. done generating) or not
  waveStartVotes: [] as number[],
  waveAutostartVotes: [] as number[],
  timeUntilWaveStart: 3,
  restartVotes: [] as number[],
  health: 100,
} satisfies GameInfo;
DEFAULT_GAME_INFO.waveReady.Value = true;

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
  gameInfo.timeUntilWaveStart = 3;
  gameInfo.restartVotes = [];
  gameInfo.health = DEFAULT_GAME_INFO.health;
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
