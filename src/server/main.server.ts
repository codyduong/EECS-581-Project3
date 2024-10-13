import { remoteEvent as playersRemoteEvent } from "shared/contexts/PlayersContext";

const players: number[] = [];

const PlayersService = game.GetService("Players");

PlayersService.PlayerAdded.Connect((player: Player) => {
  print(`Player [id: ${player.UserId}, name: ${player.Name}] joined`);
  players.push(player.UserId);
  playersRemoteEvent.FireAllClients(players);
});

PlayersService.PlayerRemoving.Connect((player: Player) => {
  print(`Player [id: ${player.UserId}, name: ${player.Name}] left`);
  players.remove(players.findIndex((id) => player.UserId === id));
  playersRemoteEvent.FireAllClients(players);
});
