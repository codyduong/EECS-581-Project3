import { setupPlayerDataEvent } from "shared/server/events/PlayerDataEvent";
import { setupPlayersEvent } from "shared/server/events/PlayersEvent";

export default function setupEvents() {
  setupPlayersEvent();
  setupPlayerDataEvent();
}
