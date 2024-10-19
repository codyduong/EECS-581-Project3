import { PlayerData } from "shared/modules/database/PlayerData";
import { findFirstSibling } from "shared/modules/utils";

export type PlayerDataEventCallback = (data: PlayerData) => void;

const playerDataEvent = findFirstSibling<RemoteEvent<PlayerDataEventCallback>>(script, "PlayerDataRE", "RemoteEvent");

export default playerDataEvent;
