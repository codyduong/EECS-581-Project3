/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file
 *
 * This is a simple wrapper to allow other .tsx? files to import the {@link RemoteEvent} which is used to communicate
 * {@link PlayerData} information. It relies on ./PlayerDataEvent.model.json being present.
 *
 * @see {@link https://rojo.space/docs/v6/sync-details/#json-models}
 */

import { PlayerData } from "shared/modules/database/PlayerData";
import { findFirstSibling } from "shared/modules/utils";

export type PlayerDataEventCallback = (data: PlayerData) => void;

const playerDataEvent = findFirstSibling<RemoteEvent<PlayerDataEventCallback>>(script, "PlayerDataRE", "RemoteEvent");

export default playerDataEvent;
