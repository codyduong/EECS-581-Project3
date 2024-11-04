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
