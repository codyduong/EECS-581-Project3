/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Manages the waves
 */

import { gameInfoEvent } from "game/modules/events";
import { serializeGameInfo } from "game/modules/events/GameInfoEvent/GameInfoEvent";
import gameInfo from "game/server/events/GameInfo";
import { GameActor } from "game/server/Game/Game";

export type WaveManagerActorTopic = "StartCountdown";

export interface WaveManagerActor extends Model {
  readonly _nominal_Actor: unique symbol;
  BindToMessage(this: WaveManagerActor, topic: WaveManagerActorTopic, callback: Callback): RBXScriptConnection;
  BindToMessageParallel: (
    this: WaveManagerActor,
    topic: WaveManagerActorTopic,
    callback: Callback,
  ) => RBXScriptConnection;
  SendMessage(this: WaveManagerActor, topic: WaveManagerActorTopic, ...message: Array<unknown>): void;
}

export const WaveManagerActor = script.GetActor()! as unknown as WaveManagerActor;

const waveManagerSharedTable = new SharedTable();

let threads: thread[] = [];

/**
 * @modifies {@link threads|`threads`}
 */
const callback = (): void => {
  if (gameInfo.timeUntilWaveStart > 0) {
    gameInfo.timeUntilWaveStart -= 1;
    task.synchronize();
    gameInfoEvent.FireAllClients(serializeGameInfo(gameInfo));
  }
  if (gameInfo.timeUntilWaveStart === 0) {
    GameActor.SendMessage("StartWave");
    gameInfo.waveStartVotes = [];
    gameInfo.timeUntilWaveStart = -2;
    gameInfoEvent.FireAllClients(serializeGameInfo(gameInfo));
  }
  threads.push(task.delay(1, callback));
};

WaveManagerActor.BindToMessageParallel("StartCountdown", () => {
  threads.forEach((thread) => task.cancel(thread));
  threads = [];

  threads.push(task.delay(1, callback));

  waveManagerSharedTable["runningCountdown"] = false;
});
