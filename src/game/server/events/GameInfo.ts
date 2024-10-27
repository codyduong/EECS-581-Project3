import { gameInfoEvent } from "game/modules/events";
import { Tower } from "game/modules/Tower";

const towers: Tower[] = [];
// a map of player id to player coins
const coins: Record<number, number> = {};

const gameInfo = {
  towers,
  coins,
};

let hasSetup = false;
export function setupGameInfo() {
  assert(hasSetup === false);
  hasSetup = true;

  game.GetService("Players").PlayerAdded.Connect((player) => {
    coins[player.UserId] = 5;

    gameInfoEvent.FireClient(player, {
      towers: gameInfo.towers,
      coins: gameInfo.coins[player.UserId],
    });
  });

  game.GetService("Players").PlayerRemoving.Connect((_player) => {
    // TODO? audit this usage? what if a player has the ability to rejoin, how do we trust the coins here?
    // coins[player.UserId] = undefined!
  });
}

export default gameInfo;
