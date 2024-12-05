import { partyEvent } from "lobby/modules/events";
import { GUARD_PARTY_ACTION, Party } from "lobby/modules/events/PartyEvent/PartyEvent";
import Guard from "shared/modules/guard/Guard";

const partyInfo = {
  parties: [] as Party[],
};

const inParty = (userId: number): [undefined, undefined] | [Party, idx: number] => {
  const i = partyInfo.parties
    .filterUndefined()
    .findIndex((party) => party.owner === userId || party.members.includes(userId));

  if (i < 0) {
    return [undefined, undefined];
  }

  return [partyInfo.parties[i], i];
};

let hasSetup = false;
/**
 * @throws if setup more than once
 */
export function setupPartyEvent(): void {
  assert(hasSetup === false);
  hasSetup = true;

  partyEvent.OnServerEvent.Connect((player, maybeAction, maybeUserId) => {
    print(player, maybeAction, maybeUserId);
    const userId = player.UserId;
    const action = GUARD_PARTY_ACTION(maybeAction);
    const [hasUserId, otherUserId] = Guard.Check(Guard.Number)(maybeUserId);
    const [party, partyIdx] = inParty(userId);
    const isOwner = party?.owner === userId;

    const fireAllClients = (): void => {
      partyEvent.FireAllClients(partyInfo.parties);
    };

    if (action === "leave") {
      assert(party !== undefined, "Can't leave if not in a party");

      const members = party.members;

      print(partyInfo.parties);

      // if owner promote the first member to owner
      if (isOwner) {
        const memberToPromote = members[0];
        if (memberToPromote === undefined) {
          // disband party if no members to promote
          partyInfo.parties[partyIdx] = undefined!; // todo add a splice or something...
          // LOL performance
          partyInfo.parties = partyInfo.parties.filterUndefined();
        } else {
          partyInfo.parties[partyIdx].owner = memberToPromote;
          partyInfo.parties[partyIdx].members = partyInfo.parties[partyIdx].members.filter(
            (member) => member !== memberToPromote,
          );
        }
      }

      // if member, simply leave
      else if (members.includes(userId)) {
        partyInfo.parties[partyIdx]!.members = members.filter((member) => member !== userId);
      }

      fireAllClients();
      return;
    }

    assert(hasUserId, `There was no userId provided with action: ${action}`);

    if (action === "invite") {
      // if we are not in a party and invited somoene, create a party and add them to the invite list

      // if we are not an owner then we have to create a party
      if (isOwner) {
        party.invites.push(otherUserId);
      }

      if (!isOwner) {
        // check if we are in a party, if we are error, otherwise create a new party
        assert(party === undefined, "Can't invite, we aren't owner of party");
        partyInfo.parties.push({
          owner: userId,
          members: [],
          invites: [otherUserId],
          requests: [],
          broadcast: "private",
        });
      }

      fireAllClients();
      return;
    }

    if (action === "request") {
      if (!party) {
        error("Requested to join not found party");
      }

      if (!party.requests.includes(userId)) {
        party.requests.push(userId);
      }

      fireAllClients();
      return;
    }

    if (action === "join") {
      const partyIndex = partyInfo.parties.findIndex((party) => party.owner === otherUserId);
      const partyToJoin = partyInfo.parties[partyIndex];

      if (!partyToJoin) {
        error("Failed to find party to join");
      }

      const isInvited = partyToJoin.invites.includes(userId);
      if (
        partyToJoin.broadcast === "all" ||
        (partyToJoin.broadcast === "friendsOnly" && false) /* todo Add friend-check logic here */ ||
        isInvited
      ) {
        if (isInvited) {
          partyToJoin.invites = partyToJoin.invites.filter((id) => id !== userId);
        }
        partyToJoin.members.push(userId);
      } else {
        error("You are not allowed to join this party");
      }

      fireAllClients();
      return;
    }

    if (action === "kick") {
      assert(partyIdx !== undefined);

      if (!isOwner) {
        error("You are not authorized to kick members");
      }

      const kickMemberIndex = party.members.indexOf(otherUserId);
      if (kickMemberIndex === -1) {
        error("User to kick is not in the party");
      }

      partyInfo.parties[partyIdx].members = party.members.filter((member) => member !== otherUserId);

      fireAllClients();
      return;
    }
  });
}

export default partyInfo;
