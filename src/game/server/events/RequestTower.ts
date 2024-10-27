/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Sets up asynchronous communication that allows clients to request a tower to be built
 *
 * @see {@link https://create.roblox.com/docs/reference/engine/classes/RemoteEvent RemoteEvent | Documentation - Roblox Creator Hub}
 */

import { gameInfoEvent, requestTower } from "game/modules/events";
import { RequestTowerAction } from "game/modules/events/RequestTower/RequestTower";
import { Tower, TowerPropsSerializable } from "game/modules/Tower";
import Guard from "shared/modules/guard/Guard";
import { assertServer } from "shared/modules/utils";
import gameInfo from "./GameInfo";

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
      const towerCost = 1; // TODO use some dynamic value

      if (coins < towerCost) {
        print("Not enough money!");
        return;
      }

      print("buying tower");

      coins -= towerCost;

      gameInfo.coins[player.UserId] = coins;

      const newTower = new Tower(props);
      newTower.model.Parent = game.Workspace;

      gameInfo.towers.push(newTower);

      print(newTower);

      game
        .GetService("Players")
        .GetPlayers()
        .forEach((player2) => {
          gameInfoEvent.FireClient(player, {
            towers: gameInfo.towers.map((t) => t.toSerializable()),
            coins: gameInfo.coins[player2.UserId],
          });
        });
    }

    if (action === "sell") {
      if (towerExists === undefined) {
        print("Tried to sell nonexistent tower");
        return;
      }

      // TODO implement selling
      print("selling tower theoretically");
    }
  });
}
