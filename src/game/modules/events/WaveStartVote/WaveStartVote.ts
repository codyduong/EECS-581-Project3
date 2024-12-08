/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file
 *
 * Simple wrapper to allow other files to import this {@link RemoteFunction}. It relies on ./init.meta.json being present.
 *
 * @see {@link https://rojo.space/docs/v6/sync-details/#json-models}
 */

export type WaveStartType = "Start" | "Auto";

export type WaveStartVoteArgs = [WaveStartType, boolean];

export type WaveStartVoteCallback = (...args: WaveStartVoteArgs) => void;

const waveStartVote = script.Parent as RemoteEvent<WaveStartVoteCallback>;

export default waveStartVote;
