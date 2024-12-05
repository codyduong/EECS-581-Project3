import React from "@rbxts/react";
import { usePartyService } from "lobby/client/contexts/PartyContext";
import { usePlayerHead } from "shared/client/gui/playerhead";

const PartyInviteGui = (): JSX.Element => {
  const { inParty, parties, inviteParty, kickParty, requestParty: _ } = usePartyService();

  const player = usePlayerHead();
  const localPlayer = game.GetService("Players").LocalPlayer;
  const isSelf = player.UserId === localPlayer.UserId;

  const isOwner = inParty?.owner !== undefined;
  const canInvite = !isSelf && (isOwner || !inParty);
  const canKick = !isSelf && isOwner && inParty.members.includes(player.UserId);
  const _canRequest =
    !isSelf &&
    !inParty &&
    parties.find((party) => party.owner === player.UserId || party.members.includes(player.UserId));

  return (
    <frame Size={new UDim2(0, 200, 0, 50)} Position={new UDim2(0, 0, 0, 50)}>
      <uilistlayout FillDirection={"Horizontal"} />
      {canInvite && (
        <textbutton
          Size={new UDim2(0, 50, 0, 50)}
          Text={"Invite player"}
          Event={{
            Activated: () => {
              inviteParty(player.UserId);
            },
          }}
        />
      )}
      {canKick && (
        <textbutton
          Size={new UDim2(0, 50, 0, 50)}
          Text={"Kick player"}
          Event={{
            Activated: () => {
              kickParty(player.UserId);
            },
          }}
        />
      )}
      {/* {canRequest && (
        <textbutton
          Size={new UDim2(0, 100, 0, 50)}
          Text={"Request to join player"}
          Event={{
            Activated: () => {
              requestParty(player.UserId);
            },
          }}
        />
      )} */}
    </frame>
  );
};

export default PartyInviteGui;
