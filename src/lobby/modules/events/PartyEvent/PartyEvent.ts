/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file
 *
 * Simple wrapper to allow other files to import this {@link RemoteEvent}. It relies on ./init.meta.json being present.
 * Communicates {@link Party} information.
 *
 * @see {@link https://rojo.space/docs/v6/sync-details/#json-models}
 */

import Guard, { Check } from "shared/modules/guard/Guard";

export type PartyBroadcast = "private" | "friendsOnly" | "all";

export type Party = {
  owner: number;
  members: number[];
  invites: number[]; // users that we have explictly allowed to join via invite
  requests: number[]; // users that we have requested to join the party
  broadcast: PartyBroadcast;
};

export type Parties = Party[];

export type PartyCallback = (data: Parties) => void;

export type PartyAction = "request" | "join" | "leave" | "kick" | "invite";

export const GUARD_PARTY_ACTION = Guard.Union(
  Guard.Literal("request"),
  Guard.Literal("join"),
  Guard.Literal("leave"),
  Guard.Literal("kick"),
  Guard.Literal("invite"),
) satisfies Check<PartyAction>;

export type PartyServerArgs = [action: Exclude<PartyAction, "leave">, userId: number] | [action: "leave"];

const partyEvent = script.Parent as RemoteEvent<PartyCallback> & {
  FireServer(this: RemoteEvent<PartyCallback>, ...args: PartyServerArgs): void;
};

export default partyEvent;
