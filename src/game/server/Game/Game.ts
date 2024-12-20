/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Main game loop
 */

import { TICK_DELAY } from "game/modules/consts";
import EnemySupervisor from "game/server/EnemySupervisor";
import { gameInfoEvent } from "game/modules/events";
import { serializeGameInfo } from "game/modules/events/GameInfoEvent/GameInfoEvent";
import { PathGenerator } from "game/modules/Path";
import { Tower } from "game/modules/tower/Tower";
import TowerSupervisor from "game/server/TowerSupervisor";
import { WaveFunctionCollapse } from "game/modules/WFC";
import gameInfo, { resetGameInfo } from "game/server/events/GameInfo";
import Guard from "shared/modules/guard/Guard";
import createWave, { WAVE_MAX } from "./Waves";

// 1459599628, guranteed contradiction { x: 12, y: 1, z: 12, pathLength: 24, horizontalPadding: 2, seed: 1459599628 }

const wfc = new WaveFunctionCollapse({ x: 12, y: 1, z: 12, pathLength: 12, horizontalPadding: 2 });

export type GameActorTopic = keyof GameActorTopicsToCallback;

export type GameActorTopicsToCallback = {
  StartGame: never[];
  StartWave: never[];
  UpdateTowerAi: ["add" | "remove" | "update", guid: string];
};

export interface GameActor extends Model {
  readonly _nominal_Actor: unique symbol;
  BindToMessage(this: GameActor, topic: GameActorTopic, callback: (...args: unknown[]) => void): RBXScriptConnection;
  BindToMessageParallel: (
    this: GameActor,
    topic: GameActorTopic,
    callback: (...args: unknown[]) => void,
  ) => RBXScriptConnection;
  SendMessage(this: GameActor, topic: GameActorTopic, ...message: GameActorTopicsToCallback[typeof topic]): void;
}

export const GameActor = script.GetActor() as unknown as GameActor;

let enemySupervisor: EnemySupervisor;
let towerSupervisor: TowerSupervisor;
let threads: thread[] = [];

/** todo encapsulate in better game logic that runs at start */
function startGame(): void {
  // cleanup old stuff
  task.synchronize();
  enemySupervisor?.Destroy();
  towerSupervisor?.Destroy();
  threads.forEach((thread) => task.cancel(thread));
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

  // Setup supervisors
  enemySupervisor = new EnemySupervisor({ starts, path });
  towerSupervisor = new TowerSupervisor();

  threads.push(
    task.spawn(() => {
      let tick = 0;
      while (true) {
        const [success, msg] = pcall(() => enemySupervisor.tick());
        const [success2, msg2] = pcall(() => towerSupervisor.tick(tick));
        if (!success) {
          error(`Enemy AI failed to run: ${msg}`);
        }
        if (!success2) {
          error(`Tower AI failed to run: ${msg2}`);
        }
        task.wait(TICK_DELAY);
        tick += 1;
      }
    }),
  );
}

GameActor!.BindToMessageParallel("StartGame", () => {
  startGame();
});

GameActor!.BindToMessageParallel("UpdateTowerAi", (maybeAction, maybeGuid) => {
  const action: GameActorTopicsToCallback["UpdateTowerAi"][0] = Guard.Union(
    Guard.Literal("add"),
    Guard.Literal("remove"),
    Guard.Literal("update"),
  )(maybeAction);
  const guid = Guard.String(maybeGuid);
  const tower = Guard.NonNil(Tower.fromGuid(guid));

  print(guid, tower);

  task.synchronize();
  switch (action) {
    case "add":
      towerSupervisor.addTowerAi(tower);
      break;
    case "remove":
      towerSupervisor.removeTowerAi(tower);
      break;
    case "update":
      towerSupervisor.updateTowerAi(tower);
      break;
    default:
      error("How did this happen? Unreachable due to invariant gurantees");
  }
});

GameActor!.BindToMessageParallel("StartWave", () => {
  print("wave starting");
  gameInfo.wave += 1;
  task.synchronize();
  gameInfoEvent.FireAllClients(serializeGameInfo(gameInfo));
  const wave = gameInfo.wave;

  const makeReadyForNextWave = (waveReward: number): void => {
    gameInfo.timeUntilWaveStart = 3;
    gameInfo.waveReady.Value = true;
    // move the autostart into regular votes
    gameInfo.waveAutostartVotes.forEach((id) => {
      if (!(id in gameInfo.waveStartVotes)) {
        gameInfo.waveStartVotes.push(id);
      }
    });
    for (const [playerId, _] of pairs(gameInfo.coins)) {
      gameInfo.coins[playerId] += waveReward;
    }
    gameInfoEvent.FireAllClients(serializeGameInfo(gameInfo));
  };

  const madeWave = createWave(wave, enemySupervisor, threads, makeReadyForNextWave);

  const isLastWave = gameInfo.wave === WAVE_MAX;
  if (isLastWave) {
    error("Last Wave!");
  }

  if (!madeWave) {
    error("failed to make wave, add end game screen");
  }
});
