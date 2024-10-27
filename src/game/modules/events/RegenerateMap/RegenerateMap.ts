/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file
 *
 * Simple wrapper to allow other files to import this {@link RemoteEvent}. It relies on ./init.meta.json being present.
 *
 * @see {@link https://rojo.space/docs/v6/sync-details/#json-models}
 */

export type RegenerateMapCallback = (voting: boolean) => void;

const regenerateMap = script.Parent as RemoteEvent<RegenerateMapCallback>;

export default regenerateMap;
