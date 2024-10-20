/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file
 *
 * This is a simple wrapper to allow other .tsx? files to import the {@link RemoteEvent} which is used to communicate
 * {@link Player} information. It relies on ./PlayersEvent.model.json being present.
 *
 * @see {@link https://rojo.space/docs/v6/sync-details/#json-models}
 */

export type PlayersEventCallback = (userIds: number[]) => void;

const playersEvent = script.Parent as RemoteEvent<PlayersEventCallback>;

export default playersEvent;
