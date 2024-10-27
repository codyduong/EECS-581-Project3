/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file
 *
 * Simple wrapper to allow other files to import this {@link RemoteEvent}. It relies on ./init.meta.json being present.
 * Communicates {@link PlayerData} information. 
 *
 * @see {@link https://rojo.space/docs/v6/sync-details/#json-models}
 */

import { PlayerData } from "shared/modules/database/PlayerData";

export type PlayerDataEventCallback = (data: PlayerData) => void;

const playerDataEvent = script.Parent as RemoteEvent<PlayerDataEventCallback>;

export default playerDataEvent;
