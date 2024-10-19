/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Contains utility functionality
 */

import { setupPlayerDataEvent } from "shared/server/events/PlayerDataEvent";
import { setupPlayersEvent } from "shared/server/events/PlayersEvent";

/**
 * Simply setup all events for the server
 *
 * IE. setup async server/client communication
 *
 * @throws If called more than once on a server
 */
export default function setupEvents() {
  setupPlayersEvent();
  setupPlayerDataEvent();
}
