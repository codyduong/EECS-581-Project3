import { findFirstSibling } from "shared/modules/utils";

export type PlayersEventCallback = (userIds: number[]) => void;

const playersEvent = findFirstSibling<RemoteEvent<PlayersEventCallback>>(script, "PlayersRE", "RemoteEvent")!;

export default playersEvent;
