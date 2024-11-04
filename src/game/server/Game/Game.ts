/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Main game loop
 */

import { TICK_DELAY } from "game/modules/consts";
import EnemySupervisor from "game/modules/EnemySupervisor";
import { gameInfoEvent } from "game/modules/events";
import { serializeGameInfo } from "game/modules/events/GameInfoEvent/GameInfoEvent";
import { PathGenerator } from "game/modules/Path";
import { WaveFunctionCollapse } from "game/modules/WFC";
import gameInfo, { COINS_INITIAL } from "game/server/events/GameInfo";

// 1459599628, guranteed contradiction { x: 12, y: 1, z: 12, pathLength: 24, horizontalPadding: 2, seed: 1459599628 }

const wfc = new WaveFunctionCollapse({ x: 12, y: 1, z: 12, pathLength: 24, horizontalPadding: 2 });

export const GameActor = script.GetActor()!;

let enemySupervisor: EnemySupervisor;
let threads: thread[] = [];

/** todo encapsulate in better game logic that runs at start */
function startGame(): void {
  // Destroy old game and other tasks that were running if there was one
  task.synchronize();
  // delete towers
  gameInfo.towers.forEach((tower) => tower.Destroy());
  gameInfo.towers = [];
  // delete enemies
  enemySupervisor?.Destroy();
  // cleanup threads
  threads.forEach((thread) => task.cancel(thread));
  // reset coins/et. cetera
  for (const [key, _] of pairs(gameInfo.coins)) {
    gameInfo.coins[key] = COINS_INITIAL;
  }
  gameInfoEvent.FireAllClients(serializeGameInfo(gameInfo));
  task.desynchronize();

  // Generate the map
  let [result, msg] = [false, ""];
  while (result === false) {
    if (msg !== "") {
      print("Failed to generate because: ");
      print(msg);
      print("retrying...");
    }
    [result, msg] = pcall(() => {
      print("actually generating");
      wfc.resetGrid();
      wfc.collapse();
    }) as LuaTuple<[boolean, string]>;
  }

  task.synchronize();
  const grid = wfc.show();
  const [starts, path] = PathGenerator.fromGrid(grid);

  // Setup enemies
  enemySupervisor = new EnemySupervisor({ starts, path });

  threads.push(
    task.spawn(() => {
      while (true) {
        const [success] = pcall(() => enemySupervisor.createEnemy());
        if (!success) {
          error("Enemy failed to generate");
        }
        task.wait(0.5);
      }
    }),
    // 0.025 seconds results in 40 ticks per second
    task.spawn(() => {
      while (true) {
        const [success] = pcall(() => enemySupervisor.tick());
        if (!success) {
          error("AI failed to run");
        }
        task.wait(TICK_DELAY);
      }
    }),
  );
}

GameActor!.BindToMessageParallel("StartGame", () => {
  startGame();
});
