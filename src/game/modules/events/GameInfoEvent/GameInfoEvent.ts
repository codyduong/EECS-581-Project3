/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file
 *
 * Simple wrapper to allow other files to import this {@link RemoteEvent}. It relies on ./init.meta.json being present.
 *
 * @see {@link https://rojo.space/docs/v6/sync-details/#json-models}
 */

import { TowerPropsSerializable, Tower } from "game/modules/towers/Tower";

export type GameInfoSerializable = {
  towers: TowerPropsSerializable[];
  coins: Record<number, number>;
  wave: 0;
  waveStartVotes: number[];
};

export type GameInfo = {
  towers: Tower[];
  coins: Record<number, number>;
  wave: 0;
  waveStartVotes: number[];
};

export const defaultGamesInfo = {
  towers: [],
  coins: {},
  wave: 0,
  waveStartVotes: [],
} as const satisfies GameInfo;

export type GameInfoEventCallback = (gameInfo: GameInfoSerializable) => void;

const gameInfoEvent = script.Parent as RemoteEvent<GameInfoEventCallback>;

export default gameInfoEvent;
