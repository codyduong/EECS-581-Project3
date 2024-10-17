import { assertServer, findFirstSibling } from "../utils";

export type PlayersEventCallback = (userIds: number[]) => void;

const playersEvent = findFirstSibling<RemoteEvent<PlayersEventCallback>>(script, "PlayersEvent", "RemoteEvent")!;

let hasSetup = false;
export function setupPlayersEvent(): void {
  assertServer();
  assert(hasSetup === false);
  hasSetup = true;

  const players: number[] = [];

  game.GetService("Players").PlayerAdded.Connect((player: Player) => {
    print(`Player [id: ${player.UserId}, name: ${player.Name}] joined`);
    players.push(player.UserId);
    playersEvent.FireAllClients(players);
  });

  game.GetService("Players").PlayerRemoving.Connect((player: Player) => {
    print(`Player [id: ${player.UserId}, name: ${player.Name}] left`);
    players.remove(players.findIndex((id) => player.UserId === id));
    playersEvent.FireAllClients(players);
  });
}

export default playersEvent;
