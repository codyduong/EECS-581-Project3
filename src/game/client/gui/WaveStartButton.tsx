/**
 * @prologue
 * @author Kyler Luong, Cody Duong <cody.qd@gmail.com>
 * @file GUI for wave start button
 *
 * @precondition N/A
 * @postcondition N/A
 * @invariant N/A
 *
 * @sideeffect Sends a vote message to {@link waveStartVote} which is handled by the server
 *
 * @throws Any DOM error occurs in the React tree
 *
 * @revisions
 * [2024.October.27]{@revision Initial creation for wave start}
 * [2024.November.24]{@revision Improve prologue and inline comments (no logical changes)}
 */

import React from "@rbxts/react";
import { useGame } from "./contexts/GameContext";
import { usePlayers } from "shared/client/gui/contexts/PlayersContext";
import waveStartVote from "game/modules/events/WaveStartVote/WaveStartVote";

interface WaveStartButtonProps {}

export default function WaveStartButton(_props: WaveStartButtonProps): JSX.Element {
  const gameInfo = useGame();
  const players = usePlayers();

  const votedFor =
    gameInfo.waveStartVotes.findIndex((id) => id === game.GetService("Players").LocalPlayer.UserId) !== -1;

  const sendVote = (vote: boolean): void => {
    waveStartVote.FireServer(vote);
  };

  const size = new UDim2(0, 200, 0, 50);

  return (
    <>
      <textlabel
        Size={size}
        Position={new UDim2(1, -size.X.Offset, 1, -(2 * size.Y.Offset))}
        Text={`Time until wave start: ${gameInfo.timeUntilWaveStart}`}
      />
      <textbutton
        Active
        Size={size}
        Position={new UDim2(1, -size.X.Offset, 1, -size.Y.Offset)}
        Text={`${votedFor === true ? "Unvote to Start Wave" : "Vote to Start Wave"} (${gameInfo.waveStartVotes.size()} / ${players.size()})`}
        Event={{
          Activated: () => {
            sendVote(!votedFor);
          },
        }}
      />
    </>
  );
}
