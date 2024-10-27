/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file
 *
 * Simple wrapper to allow other files to import this {@link RemoteEvent}. It relies on ./init.meta.json being present.
 *
 * @see {@link https://rojo.space/docs/v6/sync-details/#json-models}
 */

import type { GameInfoSerializable } from "game/client/gui/contexts/GameContext";

export type GameInfoEventCallback = (gameInfo: GameInfoSerializable) => void;

const gameInfoEvent = script.Parent as RemoteEvent<GameInfoEventCallback>;

export default gameInfoEvent;
