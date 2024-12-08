/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Sets up asynchronous communication to regenerate the game map
 *
 * @see {@link https://create.roblox.com/docs/reference/engine/classes/RemoteEvent RemoteEvent | Documentation - Roblox Creator Hub}
 */

import { assertServer } from "shared/modules/utils";
import waveStartVote, { WaveStartType } from "game/modules/events/WaveStartVote/WaveStartVote";
import Guard, { Check } from "shared/modules/guard/Guard";
import gameInfo from "./GameInfo";
import { gameInfoEvent } from "game/modules/events";
import { serializeGameInfo } from "game/modules/events/GameInfoEvent/GameInfoEvent";
import { WaveManagerActor } from "game/server/WaveManager/WaveManager";

/**
 * Checks whether we have enough players to start the vote, if so we start the countdown, if not we don't. Once
 * countdown reaches zero, then send startWave message
 *
 * @param {Player} player, the current player to add or remove a vote for
 * @param {boolean} vote, either to add (true) or remove (false) a player's vote
 */
const changeWaveStart = (player: Player, vote: boolean): void => {
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
};

const changeAutoWaveStart = (player: Player, vote: boolean): void => {
  const index = gameInfo.waveAutostartVotes.findIndex((id) => id === player.UserId);

  // if voted for and has no vote already
  if (vote && index === -1) {
    gameInfo.waveAutostartVotes.push(player.UserId);
  }

  // if voted against (ie. removing vote) and has vote
  if (!vote && index !== -1) {
    gameInfo.waveAutostartVotes.remove(index);
  }

  // if voted for and has vote already -> do nothing

  // if voted against (ie. removing vote) and has no vote -> do nothing
};

const GuardWaveStartType: Check<WaveStartType> = Guard.Union(Guard.Literal("Start"), Guard.Literal("Auto"));

let hasSetup = false;
/**
 * @throws if setup more than once
 */
export function setupWaveStartVote(): void {
  assertServer();
  assert(hasSetup === false);
  hasSetup = true;

  waveStartVote.OnServerEvent.Connect((player, maybeType, maybeBool) => {
    const t = GuardWaveStartType(maybeType);
    const vote = Guard.Boolean(maybeBool);

    if (t === "Start") {
      changeWaveStart(player, vote);
    } else {
      changeWaveStart(player, vote);
      changeAutoWaveStart(player, vote);
    }
    gameInfoEvent.FireAllClients(serializeGameInfo(gameInfo));
    WaveManagerActor.SendMessage("CheckWaveStartStatus");
  });

  game.GetService("Players").PlayerRemoving.Connect((player) => {
    changeWaveStart(player, false);
    changeAutoWaveStart(player, false);
    gameInfoEvent.FireAllClients(serializeGameInfo(gameInfo));
    WaveManagerActor.SendMessage("CheckWaveStartStatus");
  });

  gameInfo.waveReady.Changed.Connect((_) => {
    WaveManagerActor.SendMessage("CheckWaveStartStatus");
  });
}
