import { setupPlayerDataEvent } from "./PlayerDataEvent";
import { setupPlayersEvent } from "./PlayersEvent";

export default function setupEvents() {
  setupPlayersEvent();
  setupPlayerDataEvent();
}
