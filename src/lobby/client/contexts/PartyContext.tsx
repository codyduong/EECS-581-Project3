import React, { createContext, useContext, useEffect, useState } from "@rbxts/react";
import { partyEvent } from "lobby/modules/events";
import { Parties, Party } from "lobby/modules/events/PartyEvent/PartyEvent";

export type PartyContext = {
  inParty: Party | undefined;
  parties: Parties;
  requestParty: (userId: number) => void;
  joinParty: (userId: number) => void;
  inviteParty: (userId: number) => void;
  kickParty: (userId: number) => void;
  leaveParty: () => void;
  startGame: () => void;
};

export const defaultPartyContext = {
  parties: [],
  inParty: undefined,
  requestParty: () => {},
  joinParty: () => {},
  leaveParty: () => {},
  inviteParty: () => {},
  kickParty: () => {},
  startGame: () => {},
} as const satisfies PartyContext;

const PartyContextActual = createContext<PartyContext>(defaultPartyContext);

interface PartyContextProps {
  children: React.ReactNode;
}

export default function PartyContext(props: PartyContextProps): JSX.Element {
  const { children } = props;

  const player = game.GetService("Players").LocalPlayer;
  const [parties, setParties] = useState<Parties>([]);
  const [inParty, setInParty] = useState<Party | undefined>(undefined);

  useEffect(() => {
    setInParty(parties.find((party) => party.members.includes(player.UserId) || party.owner === player.UserId));
  }, [parties, player.UserId]);

  useEffect(() => {
    const events: RBXScriptConnection[] = [];

    events.push(
      partyEvent.OnClientEvent.Connect((parties) => {
        setParties(parties);
      }),
    );

    return () => {
      events.forEach((event) => {
        event.Disconnect();
      });
    };
  }, []);

  const requestParty = (userId: number): void => {
    partyEvent.FireServer("request", userId);
  };

  const joinParty = (userId: number): void => {
    partyEvent.FireServer("join", userId);
  };

  const leaveParty = (): void => {
    partyEvent.FireServer("leave");
  };

  const kickParty = (userId: number): void => {
    partyEvent.FireServer("kick", userId);
  };

  const inviteParty = (userId: number): void => {
    partyEvent.FireServer("invite", userId);
  };

  const startGame = (): void => {
    partyEvent.FireServer("start");
  };

  return (
    <PartyContextActual.Provider
      value={{ parties, inParty, requestParty, joinParty, leaveParty, kickParty, inviteParty, startGame }}
    >
      {children}
    </PartyContextActual.Provider>
  );
}

export function usePartyService(): PartyContext {
  return useContext(PartyContextActual);
}
