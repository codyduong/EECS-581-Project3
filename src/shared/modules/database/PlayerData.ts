/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file
 *
 * This is the type only or default information for PlayerData. It has to be here to allow clients to know the shape of
 * the data. The more sensitive details/implementation is stored at "../../server/database/PlayerData.ts"
 *
 */

/** */
export type PlayerData = {};
export const defaultPlayerData = {} satisfies PlayerData;
