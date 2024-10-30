/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Sets up asynchronous communication to regenerate the game map
 *
 * @see {@link https://create.roblox.com/docs/reference/engine/classes/RemoteEvent RemoteEvent | Documentation - Roblox Creator Hub}
 */

import { assertServer } from "shared/modules/utils";
import waveStartVote from "game/modules/events/WaveStartVote/WaveStartVote";
import Guard from "shared/modules/guard/Guard";
import gameInfo from "./GameInfo";
import { gameInfoEvent } from "game/modules/events";
import { serializeGameInfo } from "game/modules/events/GameInfoEvent/GameInfoEvent";
import { players } from "shared/server/events/PlayersEvent";
import { WaveManagerActor } from "game/server/WaveManager/WaveManager";

/**
 * Checks whether we have enough players to start the vote, if so we start the countdown, if not we don't. Once
 * countdown reaches zero, then send startWave message
 *
 * @param {Player} player, the current player to add or remove a vote for
 * @param {boolean} vote, either to add (true) or remove (false) a player's vote
 */
const checkWaveCountdown = (player: Player, vote: boolean): void => {
  const index = gameInfo.waveStartVotes.findIndex((id) => id === player.UserId);

  // if voted for and has no vote already
  if (vote && index === -1) {
    gameInfo.waveStartVotes.push(player.UserId);
  }

  // if voted against (ie. removing vote) and has vote
  if (!vote && index !== -1) {
    gameInfo.waveStartVotes.remove(index);
  }

  // if voted for and has vote already -> do nothing

  // if voted against (ie. removing vote) and has no vote -> do nothing

  // if we have all votes then start the wave start timer

  // if we have -1 (ie. 0th wave, then start timer when one player votes to start)
  // if (gameInfo.wave === 0) {
  //   if (gameInfo.waveStartVotes.size() > 0 && gameInfo.timeUntilWaveStart === -1) {
  //     gameInfo.timeUntilWaveStart = 30;
  //     hasChanged = true;
  //   }
  //   if (gameInfo.waveStartVotes.size() === 0 && gameInfo.timeUntilWaveStart !== -1) {
  //     gameInfo.timeUntilWaveStart = -1;
  //     hasChanged = true;
  //   }
  // }

  if (gameInfo.waveStartVotes.size() >= players.size()) {
    gameInfo.timeUntilWaveStart = 5;
    WaveManagerActor.SendMessage("StartCountdown");
  } else {
    gameInfo.timeUntilWaveStart = -1;
  }

  gameInfoEvent.FireAllClients(serializeGameInfo(gameInfo));
};

let hasSetup = false;
/**
 * @throws if setup more than once
 */
export function setupWaveStartVote(): void {
  assertServer();
  assert(hasSetup === false);
  hasSetup = true;

  waveStartVote.OnServerEvent.Connect((player, maybeBool) => {
    const vote = Guard.Boolean(maybeBool);

    checkWaveCountdown(player, vote);
  });

  game.GetService("Players").PlayerRemoving.Connect((player) => {
    checkWaveCountdown(player, false);
  });
}
