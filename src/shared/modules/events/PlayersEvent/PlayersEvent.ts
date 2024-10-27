/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file
 *
 * Simple wrapper to allow other files to import this {@link RemoteEvent}. It relies on ./init.meta.json being present.
 * {@link Player} information. It relies on ./init.meta.json being present.
 *
 * @see {@link https://rojo.space/docs/v6/sync-details/#json-models}
 */

export type PlayersEventCallback = (userIds: number[]) => void;

const playersEvent = script.Parent as RemoteEvent<PlayersEventCallback>;

export default playersEvent;
