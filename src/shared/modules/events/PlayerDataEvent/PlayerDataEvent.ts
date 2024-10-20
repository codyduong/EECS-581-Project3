/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file
 *
 * This is a simple wrapper to allow other .tsx? files to import the {@link RemoteEvent} which is used to communicate
 * {@link PlayerData} information. It relies on ./init.meta.json being present.
 *
 * @see {@link https://rojo.space/docs/v6/sync-details/#json-models}
 */

import { PlayerData } from "shared/modules/database/PlayerData";

export type PlayerDataEventCallback = (data: PlayerData) => void;

const playerDataEvent = script.Parent as RemoteEvent<PlayerDataEventCallback>;

export default playerDataEvent;
