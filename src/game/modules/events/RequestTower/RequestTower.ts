/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file
 *
 * Simple wrapper to allow other files to import this {@link RemoteFunction}. It relies on ./init.meta.json being present.
 *
 * @see {@link https://rojo.space/docs/v6/sync-details/#json-models}
 */

import { TowerProps } from "game/modules/tower/Tower";

export type RequestTowerAction = "buy" | "sell";

export type RequestTowerArgs = [NonNullable<TowerProps>, RequestTowerAction];

export type RequestTowerCallback = (...args: RequestTowerArgs) => void;

const requestTower = script.Parent as RemoteEvent<RequestTowerCallback>;

export default requestTower;
