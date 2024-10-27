import { Tower } from "game/modules/Tower";

const towers: Tower[] = [];
// a map of player id to player coins
const coins: Record<number, number> = {};

const gameInfo = {
  towers,
  coins
}

let hasSetup = false;
export function setupGameInfo() {
  assert(hasSetup === false);
  hasSetup = true;

  game.GetService("Players").PlayerAdded.Connect((player) => {
    coins[player.UserId] = 5
  })

  game.GetService("Players").PlayerRemoving.Connect((player) => {
    // TODO? audit this usage? what if a player has the ability to rejoin, how do we trust the coins here?
    // coins[player.UserId] = undefined!
  })
}

export default gameInfo