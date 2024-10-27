/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file
 *
 * This is a simple wrapper to allow other .tsx? files to import the {@link RemoteEvent} which is used to communicate
 * {@link Player} information. It relies on ./PlayersEvent.model.json being present.
 *
 * @see {@link https://rojo.space/docs/v6/sync-details/#json-models}
 */

export type RegenerateMapCallback = (voting: boolean) => void;

const regenerateMap = script.Parent as RemoteEvent<RegenerateMapCallback>;

export default regenerateMap;
