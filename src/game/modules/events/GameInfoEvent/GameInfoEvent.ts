/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file
 *
 * Simple wrapper to allow other files to import this {@link RemoteEvent}. It relies on ./init.meta.json being present.
 *
 * @see {@link https://rojo.space/docs/v6/sync-details/#json-models}
 */

import { TowerPropsSerializable, Tower } from "game/modules/tower/Tower";

export type GameInfoSerializable = {
  // This key is a hack to ensure that GameInfoSerializable and GameInfo are not structurally type matched (not desired)
  $: unknown;
  towers: TowerPropsSerializable[];
  coins: Record<number, number>;
  wave: number;
  waveStartVotes: number[];
  timeUntilWaveStart: number;
  restartVotes: number[];
};

export type GameInfo = {
  towers: Tower[];
  coins: Record<number, number>;
  wave: number;
  waveStartVotes: number[];
  timeUntilWaveStart: number;
  restartVotes: number[];
};

export const serializeGameInfo = (gameInfo: GameInfo): GameInfoSerializable => {
  return {
    $: 0,
    towers: gameInfo.towers.map((t) => t.toSerializable()),
    coins: gameInfo.coins,
    wave: gameInfo.wave,
    waveStartVotes: gameInfo.waveStartVotes,
    timeUntilWaveStart: gameInfo.timeUntilWaveStart,
    restartVotes: gameInfo.restartVotes,
  };
};

export type GameInfoEventCallback = (gameInfo: GameInfoSerializable) => void;

const gameInfoEvent = script.Parent as RemoteEvent<GameInfoEventCallback>;

export default gameInfoEvent;
