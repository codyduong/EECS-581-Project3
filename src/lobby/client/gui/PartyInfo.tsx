import React from "@rbxts/react";
import Frame from "shared/client/gui/frame";
import { usePartyService } from "lobby/client/contexts/PartyContext";

const Players = game.GetService("Players");

const getName = (userId: number): string => {
  const [hasName, name] = pcall(() => Players.GetNameFromUserIdAsync(userId));
  return hasName ? name : "Unknown";
};

interface PartyInfoProps {}

export default function PartyInfo(_props: PartyInfoProps): JSX.Element {
  const { inParty, parties, joinParty, leaveParty } = usePartyService();

  const localPlayer = Players.LocalPlayer;

  return (
    <Frame Size={new UDim2(0, 100, 0, 500)} Position={new UDim2(0, 0, 0, 0)}>
      <uilistlayout FillDirection={"Vertical"} SortOrder={"LayoutOrder"} />
      <textbox Text={`Party Info`} Size={new UDim2(1, 0, 0, 50)} Interactable={false} LayoutOrder={-10} />
      {inParty !== undefined ? (
        <>
          <textbox
            Text={`[Owner] ${inParty.owner}: ${getName(inParty.owner)}`}
            Size={new UDim2(1, 0, 0, 50)}
            Interactable={false}
            LayoutOrder={-1}
          />
          {inParty.members.map((member, i) => {
            return (
              <textbox
                key={member}
                Text={`${member}: ${getName(member)}`}
                Size={new UDim2(1, 0, 0, 50)}
                Interactable={false}
                LayoutOrder={i}
              />
            );
          })}
          <textbutton
            // todo
            LayoutOrder={100000}
            Text={`Leave Party`}
            Size={new UDim2(1, 0, 0, 50)}
            Event={{
              Activated: () => {
                leaveParty();
              },
            }}
          />
          {(inParty.owner === localPlayer.UserId || !inParty) && (
            <textbutton
              LayoutOrder={100001}
              Text={`Start Game`}
              Size={new UDim2(1, 0, 0, 50)}
              Event={{
                Activated: () => {
                  // todo
                  print("starting game");
                },
              }}
            />
          )}
        </>
      ) : (
        <>
          {parties
            .filter((party) => party.invites.includes(localPlayer.UserId))
            .map((party) => (
              <textbutton
                key={party.owner}
                Text={`${party.owner} invites you to join their party`}
                Size={new UDim2(1, 0, 0, 50)}
                Event={{
                  Activated: () => {
                    joinParty(party.owner);
                  },
                }}
              />
            ))}
        </>
      )}
    </Frame>
  );
}
