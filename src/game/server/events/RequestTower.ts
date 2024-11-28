/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Sets up asynchronous communication that allows clients to request a tower to be built
 *
 * @see {@link https://create.roblox.com/docs/reference/engine/classes/RemoteEvent RemoteEvent | Documentation - Roblox Creator Hub}
 */

import { gameInfoEvent, requestTower } from "game/modules/events";
import { RequestTowerAction } from "game/modules/events/RequestTower/RequestTower";
import {
  Tower,
  TOWER_TYPE0_GUARD,
  TOWER_TYPE_GUARD,
  TowerPropsSerializable,
  TYPE_TO_META,
} from "game/modules/tower/Tower";
import Guard from "shared/modules/guard/Guard";
import { assertServer } from "shared/modules/utils";
import gameInfo from "./GameInfo";
import { serializeGameInfo } from "game/modules/events/GameInfoEvent/GameInfoEvent";
import { GameActor } from "game/server/Game/Game";

const guardRequestTower = (v: unknown): TowerPropsSerializable =>
  Guard.Record({
    guid: Guard.String,
    cframe: Guard.CFrame,
    type: TOWER_TYPE_GUARD,
  })(v);

const guardType = (v: unknown): RequestTowerAction =>
  Guard.Union(Guard.Literal("buy"), Guard.Literal("sell"), Guard.Literal("upgrade"))(v);

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

    let coins = gameInfo.coins[player.UserId];
    assert(coins !== undefined, "Failed to find player coins?");

    const towerCost = TYPE_TO_META[props.type].stats.cost;

    if (action === "buy") {
      // it is possible to request a tower you can't normally buy. so guard this to level 0 types
      const [pass, _] = Guard.Check(TOWER_TYPE0_GUARD)(props.type);
      if (!pass) {
        print("Attempted to buy non level 0 tower");
      }

      if (towerExists !== undefined) {
        print("We already processed this tower request");
        return;
      }

      if (coins < towerCost) {
        print("Not enough money!");
        return;
      }

      print("buying tower");

      coins -= towerCost;

      gameInfo.coins[player.UserId] = coins;

      const newTower = new Tower(props);
      GameActor.SendMessage("UpdateTowerAi", "add", newTower.guid);
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

      print("selling tower");

      // Determine the sell value (could be a percentage of the cost)
      const sellValue = 0.5; // e.g., 50% of the original cost
      const towerSellPrice = math.floor(towerCost * sellValue);

      // Refund the player
      gameInfo.coins[player.UserId] += towerSellPrice;
      print(`Refunded ${towerSellPrice} coins to player ${player.Name}`);

      // Remove the tower from the game and from gameInfo
      gameInfo.towers = gameInfo.towers.filter((tower) => tower.guid !== props.guid);
      GameActor.SendMessage("UpdateTowerAi", "remove", towerExists.guid);
      towerExists.Destroy();

      gameInfoEvent.FireAllClients(serializeGameInfo(gameInfo));
    }

    if (action === "upgrade") {
      if (towerExists === undefined) {
        print("Tried to upgrade nonexistent tower");
        return;
      }

      const upgradesTo = Tower.getTypeStats(towerExists.type).upgradesTo;

      if (upgradesTo === undefined) {
        print("No further upgrade permitted");
        return;
      }

      const upgradesToStats = Tower.getTypeStats(upgradesTo);
      const upgradeCost = upgradesToStats.cost;

      if (coins < upgradeCost) {
        print("Not enough money!");
        return;
      }

      print("upgrading tower");

      coins -= upgradeCost;

      gameInfo.coins[player.UserId] = coins;

      towerExists.upgrade();
      GameActor.SendMessage("UpdateTowerAi", "update", towerExists.guid);
      gameInfoEvent.FireAllClients(serializeGameInfo(gameInfo));
    }
  });
}
