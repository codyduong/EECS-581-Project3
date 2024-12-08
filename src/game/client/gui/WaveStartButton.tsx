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
import waveStartVote, { WaveStartType } from "game/modules/events/WaveStartVote/WaveStartVote";
import Frame from "shared/client/gui/frame";

interface WaveStartButtonProps {}

export default function WaveStartButton(_props: WaveStartButtonProps): JSX.Element {
  const gameInfo = useGame();
  const players = usePlayers();

  const votedFor =
    gameInfo.waveStartVotes.findIndex((id) => id === game.GetService("Players").LocalPlayer.UserId) !== -1;

  const autoVotedFor =
    gameInfo.waveAutostartVotes.findIndex((id) => id === game.GetService("Players").LocalPlayer.UserId) !== -1;

  const sendVote = (t: WaveStartType, vote: boolean): void => {
    waveStartVote.FireServer(t, vote);
  };

  const size = new UDim2(0, 200, 0, 50);

  return (
    <Frame Position={new UDim2(1, -200, 1, -150)}>
      <uilistlayout FillDirection={"Vertical"} SortOrder={"LayoutOrder"} />
      <textlabel LayoutOrder={0} Size={size} Text={`Time until wave start: ${gameInfo.timeUntilWaveStart}`} />
      <textbutton
        LayoutOrder={1}
        Active
        Size={size}
        Text={`${autoVotedFor === true ? "Turn off Autovote" : "Turn on Autovote"}`}
        Event={{
          Activated: () => {
            sendVote("Auto", !autoVotedFor);
          },
        }}
      />
      <textbutton
        LayoutOrder={2}
        Active
        Size={size}
        Text={`${votedFor === true ? "Unvote to Start Wave" : "Vote to Start Wave"} (${gameInfo.waveStartVotes.size()} / ${players.size()})`}
        Event={{
          Activated: () => {
            sendVote("Start", !votedFor);
          },
        }}
      />
    </Frame>
  );
}
