import { gameInfoEvent } from "game/modules/events";
import { GameInfo } from "game/modules/events/GameInfoEvent/GameInfoEvent";
import { Tower } from "game/modules/towers/Tower";

const towers: Tower[] = [];
// a map of player id to player coins
const coins: Record<number, number> = {};

const gameInfo = {
  towers,
  coins,
  wave: 0,
  waveStartVotes: [],
} satisfies GameInfo;

let hasSetup = false;
export function setupGameInfo() {
  assert(hasSetup === false);
  hasSetup = true;

  game.GetService("Players").PlayerAdded.Connect((player) => {
    gameInfo.coins[player.UserId] = 10;

    gameInfoEvent.FireAllClients({
      towers: gameInfo.towers,
      coins: gameInfo.coins,
      wave: 0,
      waveStartVotes: [],
    });
  });

  game.GetService("Players").PlayerRemoving.Connect((_player) => {
    // TODO? audit this usage? what if a player has the ability to rejoin, how do we trust the coins here?
    // coins[player.UserId] = undefined!
  });
}

export default gameInfo;
