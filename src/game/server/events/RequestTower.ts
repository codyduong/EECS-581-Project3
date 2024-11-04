/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Sets up asynchronous communication that allows clients to request a tower to be built
 *
 * @see {@link https://create.roblox.com/docs/reference/engine/classes/RemoteEvent RemoteEvent | Documentation - Roblox Creator Hub}
 */

import { gameInfoEvent, requestTower } from "game/modules/events";
import { RequestTowerAction } from "game/modules/events/RequestTower/RequestTower";
import { Tower, TowerPropsSerializable } from "game/modules/tower/Tower";
import Guard from "shared/modules/guard/Guard";
import { assertServer } from "shared/modules/utils";
import gameInfo from "./GameInfo";
import { serializeGameInfo } from "game/modules/events/GameInfoEvent/GameInfoEvent";

const guardRequestTower = (v: unknown): TowerPropsSerializable =>
  Guard.Record({
    guid: Guard.String,
    cframe: Guard.CFrame,
    type: Guard.Literal("Noob"),
  })(v);

const guardType = (v: unknown): RequestTowerAction => Guard.Or(Guard.Literal("buy"), Guard.Literal("sell"))(v);

let hasSetup = false;
/**
 * @throws if setup more than once
 */
export function setupRequestTower(): void {
  assertServer();
  assert(hasSetup === false);
  hasSetup = true;

  requestTower.OnServerEvent.Connect((player, request, act) => {
    print(request, act);
    const props = guardRequestTower(request);
    const action = guardType(act);

    // we have to check we haven't already processed this request, "idempotency"
    // technically the GenerateGUID() mechanism has a 1 in 1 trillion chance of collision... Oh well...
    const towerExists = gameInfo.towers.find((tower) => tower.guid === props.guid);

    if (action === "buy") {
      if (towerExists !== undefined) {
        print("We already processed this tower request");
        return;
      }

      let coins = gameInfo.coins[player.UserId];

      assert(coins !== undefined, "Failed to find player coins?");

      // all towers cost 1 coin. Because...
      const towerCost = 2; // TODO use some dynamic value

      if (coins < towerCost) {
        print("Not enough money!");
        return;
      }

      print("buying tower");

      coins -= towerCost;

      gameInfo.coins[player.UserId] = coins;

      const newTower = new Tower(props);
      // newTower.model.Parent = game.Workspace; // dont parent and send to clients. clients render on their own

      gameInfo.towers.push(newTower);

      print(newTower);

      gameInfoEvent.FireAllClients(serializeGameInfo(gameInfo));
    }

    if (action === "sell") {
      if (towerExists === undefined) {
        print("Tried to sell nonexistent tower");
        return;
      }

      // Determine the sell value (could be a percentage of the cost)
      const sellValue = 0.5; // e.g., 50% of the original cost
      const towerSellPrice = math.floor(2 * sellValue); // TODO: Adjust based on actual tower cost

      // Refund the player
      gameInfo.coins[player.UserId] += towerSellPrice;
      print(`Refunded ${towerSellPrice} coins to player ${player.Name}`);

      // Remove the tower from the game and from gameInfo
      gameInfo.towers = gameInfo.towers.filter((tower) => tower.guid !== props.guid);
      towerExists.Destroy();

      gameInfoEvent.FireAllClients(serializeGameInfo(gameInfo));
    }
  });
}
