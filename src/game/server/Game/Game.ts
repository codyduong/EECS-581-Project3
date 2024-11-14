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
import gameInfo, { resetGameInfo } from "game/server/events/GameInfo";

// 1459599628, guranteed contradiction { x: 12, y: 1, z: 12, pathLength: 24, horizontalPadding: 2, seed: 1459599628 }

const wfc = new WaveFunctionCollapse({ x: 12, y: 1, z: 12, pathLength: 24, horizontalPadding: 2 });

export type GameActorTopic = "StartGame" | "StartWave";

export interface GameActor extends Model {
  readonly _nominal_Actor: unique symbol;
  BindToMessage(this: GameActor, topic: GameActorTopic, callback: Callback): RBXScriptConnection;
  BindToMessageParallel: (this: GameActor, topic: GameActorTopic, callback: Callback) => RBXScriptConnection;
  SendMessage(this: GameActor, topic: GameActorTopic, ...message: Array<unknown>): void;
}

export const GameActor = script.GetActor() as unknown as GameActor;

let enemySupervisor: EnemySupervisor;
let threads: thread[] = [];

/** todo encapsulate in better game logic that runs at start */
function startGame(): void {
  // Destroy old game and other tasks that were running if there was one
  task.synchronize();
  // delete enemies
  enemySupervisor?.Destroy();
  // cleanup threads
  threads.forEach((thread) => task.cancel(thread));
  // reset coins/et. cetera
  resetGameInfo();

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
        const [success] = pcall(() => enemySupervisor.tick());
        if (!success) {
          error("AI failed to run");
        }
        task.wait(TICK_DELAY);
      }
    }),
  );

  // we have to wait to spawn these threads seperate from each other... if we don't we will create two enemies
  // "too" close to each other, before tick is ready and running
  task.wait(1);

  // threads.push(
  //   task.spawn(() => {
  //     while (true) {
  //       const [success] = pcall(() => enemySupervisor.createEnemy());
  //       if (!success) {
  //         error("Enemy failed to generate");
  //       }
  //       task.wait(0.5);
  //     }
  //   }),
  // );
}

GameActor!.BindToMessageParallel("StartGame", () => {
  startGame();
});

GameActor!.BindToMessageParallel("StartWave", () => {
  print("wave starting");
  gameInfo.wave += 1;
  task.synchronize();
  gameInfoEvent.FireAllClients(serializeGameInfo(gameInfo));
  const wave = gameInfo.wave;

  const makeReadyForNextWave = (): void => {
    gameInfo.timeUntilWaveStart = -1;
    gameInfoEvent.FireAllClients(serializeGameInfo(gameInfo));
  };

  switch (wave) {
    case 1:
      for (let i = 0; i < 5; i++) {
        threads.push(
          task.delay(0.5 * i, () => {
            const [success] = pcall(() => enemySupervisor.createEnemy());
            if (!success) {
              error("Enemy failed to generate");
            }
            if (i >= 4) {
              print("done generating");
              makeReadyForNextWave();
            }
          }),
        );
      }
      break;
    case 2:
      for (let i = 0; i < 10; i++) {
        threads.push(
          task.delay(0.5 * i, () => {
            const [success] = pcall(() => enemySupervisor.createEnemy());
            if (!success) {
              error("Enemy failed to generate");
            }
            if (i >= 9) {
              print("done generating");
              makeReadyForNextWave();
            }
          }),
        );
      }
      break;
    default:
      print("Wave not made");
  }
});
