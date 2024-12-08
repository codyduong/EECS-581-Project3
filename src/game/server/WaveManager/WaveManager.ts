/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Manages the waves
 */

import { gameInfoEvent } from "game/modules/events";
import { serializeGameInfo } from "game/modules/events/GameInfoEvent/GameInfoEvent";
import gameInfo from "game/server/events/GameInfo";
import { GameActor } from "game/server/Game/Game";
import { players } from "shared/server/events/PlayersEvent";

export type WaveManagerActorTopic = "CheckWaveStartStatus";

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

let threads: thread[] = [];

/**
 * @modifies {@link threads|`threads`}
 */
const callback = (): void => {
  if (gameInfo.waveStartVotes.size() < players.size()) {
    return;
  }

  if (gameInfo.timeUntilWaveStart > 0) {
    gameInfo.timeUntilWaveStart -= 1;
    task.synchronize();
    gameInfoEvent.FireAllClients(serializeGameInfo(gameInfo));
    threads.push(task.delay(1, callback));
  } else if (gameInfo.timeUntilWaveStart === 0) {
    GameActor.SendMessage("StartWave");
    gameInfo.waveStartVotes = [];
    // on last call for some reason it is parallel? idk... just pcall this
    gameInfo.waveReady.Value = false;
    gameInfoEvent.FireAllClients(serializeGameInfo(gameInfo));
  }
};

WaveManagerActor.BindToMessageParallel("CheckWaveStartStatus", () => {
  threads.forEach((thread) => task.cancel(thread));
  threads = [];

  threads.push(task.delay(1, callback));
});
