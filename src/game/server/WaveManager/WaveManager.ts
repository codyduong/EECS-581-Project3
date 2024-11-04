/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Manages the waves
 */

import { gameInfoEvent } from "game/modules/events";
import { serializeGameInfo } from "game/modules/events/GameInfoEvent/GameInfoEvent";
import gameInfo from "game/server/events/GameInfo";

export const WaveManagerActor = script.GetActor()!;

const waveManagerSharedTable = new SharedTable();

WaveManagerActor!.BindToMessageParallel("StartCountdown", () => {
  if (waveManagerSharedTable["runningCountdown"] === true) {
    // print("already running");
    return;
  }

  waveManagerSharedTable["runningCountdown"] = true;

  task.synchronize();
  while (true) {
    if (gameInfo.timeUntilWaveStart <= 0) {
      // TODO perform some action (ie. start wave, if we are at 0, if we are at -1 don't do anything)
      break;
    }
    task.wait(1);
    if (gameInfo.timeUntilWaveStart <= 0) {
      // ditto
      break;
    }
    gameInfo.timeUntilWaveStart -= 1;
    gameInfoEvent.FireAllClients(serializeGameInfo(gameInfo));
  }

  waveManagerSharedTable["runningCountdown"] = false;
});
