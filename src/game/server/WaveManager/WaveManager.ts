/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Manages the waves
 */

import { gameInfoEvent } from "game/modules/events";
import { serializeGameInfo } from "game/modules/events/GameInfoEvent/GameInfoEvent";
import gameInfo from "game/server/events/GameInfo";

export const WaveManagerActor = script.GetActor()!;

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
  threads.push(task.delay(1, callback));
};

WaveManagerActor!.BindToMessageParallel("StartCountdown", () => {
  threads.forEach((thread) => task.cancel(thread));
  threads = [];

  threads.push(task.delay(1, callback));

  waveManagerSharedTable["runningCountdown"] = false;
});
