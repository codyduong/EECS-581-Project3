/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Contains type definitions for {@link https://github.com/anthony0br/DocumentService/ DocumentService}
 * @see {@link https://anthony0br.github.io/DocumentService/api/DocumentService#types}
 */

/**
 * Update hooks will run on any operation that writes to Data Stores e.g. .Save().
 *
 * Read hooks will run on any operation that reads from Data Stores e.g. .Peek().
 *
 * @see {@link https://anthony0br.github.io/DocumentService/api/DocumentService#HookEvent}
 */
export type HookEvent = "Open" | "Close" | "Update" | "Read";

/**
 * Subtype of Result. A success.
 *
 * @see {@link https://anthony0br.github.io/DocumentService/api/DocumentService#Ok%3CT%3E}
 */
export type Ok<T> = {
  success: true;
  data: T;
};

/**
 * Subtype of Result. An error.
 *
 * @see {@link https://anthony0br.github.io/DocumentService/api/DocumentService#Err%3CE%3E}
 */
export type Err<E> = {
  success: false;
  reason: E;
};

/**
 * The result of a yielding operation that could error. You should always write error handling for all types of errors
 * that can be returned.
 *
 * @see {@link https://anthony0br.github.io/DocumentService/api/DocumentService#Result%3CT,E%3E}
 */
export type Result<T, E> = Ok<T> | Err<E>;

/**
 * Indicates the Roblox API failed, e.g. too many requests.
 *
 * @see {@link https://anthony0br.github.io/DocumentService/api/DocumentService#RobloxAPIError}
 */
export type RobloxAPIError = "RobloxAPIError";

/**
 * Indicates the document was locked by some other session.
 *
 * @see {@link https://anthony0br.github.io/DocumentService/api/DocumentService#SessionLockedError}
 */
export type SessionLockedError = "SessionLockedError";

/**
 * Indicates the document's check function failed.
 *
 * @see {@link https://anthony0br.github.io/DocumentService/api/DocumentService#CheckError}
 */
export type CheckError = "CheckError";

/**
 * Attempted to load data that has been migrated ahead to a version that isn't backwards compatible with the latest
 * version our session has.
 *
 * @see {@link https://anthony0br.github.io/DocumentService/api/DocumentService#BackwardsCompatibilityError}
 */
export type BackwardsCompatibilityError = "BackwardsCompatibilityError";

/**
 * This indicates the key provided is not managed by DocumentService, or has been corrupted.
 *
 * In the case of a SchemaError during opening, a new Document will be created, enclosing the existing value at the key.
 *
 * @see {@link https://anthony0br.github.io/DocumentService/api/DocumentService#SchemaError}
 */
export type SchemaError = "SchemaError";

/**
 * Data format versions start at 0. The first migration should migrate from 0 to 1.
 *
 * If you have data existing in the key before you open a Document, this will be considered version 0 and migrations
 * will run.
 *
 * If backwardsCompatible is false, loading this version and later versions in an older server without this migration
 * defined will fail.
 *
 * The current version is defined by the length of this array.
 *
 * @note WARNING: If you make a not-backwards-compatible migration on not-session-locked Documents, you must shut down
 * all servers, or old servers will break.
 *
 * @see {@link https://anthony0br.github.io/DocumentService/api/DocumentService#Migrations}
 */
export type Migrations = {
  backwardsCompatible: boolean;
  migrate: (data: any) => any;
}[];

/**
 * Takes data and returns an updated version of it. Ideally this should be a pure function.
 *
 * @see {@link https://anthony0br.github.io/DocumentService/api/DocumentService#Transform}
 */
export type Transform<T> = (data: T) => T;

/**
 * An interface, implemented by DataStore in Roblox, to allow dependency injection (e.g. MockDataStores).
 *
 * There is currently an issue where passing `DataStore` will result in a type error, even though `DataStore` currently
 * implements `DataStoreInterface`. You can typecast to to unknown (`as unknown`) as a workaround.
 *
 * @see {@link https://anthony0br.github.io/DocumentService/api/DocumentService#DataStoreInterface}
 */
export interface DataStoreInterface {
  UpdateAsync(
    key: string,
    callback: (v: LuaTuple<[data: unknown, DataStoreKeyInfo]>) => LuaTuple<[unknown, number[]?, unknown?]>,
  ): LuaTuple<[unknown, DataStoreKeyInfo]>;
  GetAsync(key: string, options: DataStoreGetOptions): LuaTuple<[unknown, DataStoreKeyInfo]>;
  RemoveAsync(key: string): LuaTuple<[unknown, DataStoreKeyInfo]>;
}
