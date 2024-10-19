/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Contains type definitions for {@link https://github.com/anthony0br/DocumentService/ DocumentService}
 */

import { DataStoreInterface } from "./DocumentService.Types";

export interface SaveUtil {
  /**
   * Errors if the data passed is not storable in JSON
   *
   * Rejects: NaN (all numbers must equal themselves) Mixed table index types Non sequential tables indexed by numbers
   * Non-string or number table indexes Cyclic tables type(value) == "userdata" Functions Metatables Threads Vectors
   *
   * @see {@link https://anthony0br.github.io/DocumentService/api/SaveUtil#assertStorable}
   */
  assertStorable(data: unknown, fieldName?: string): void;
  /**
   * Luau uuid implementation.
   *
   * Based off of https://gist.github.com/jrus/3197011
   *
   * @see {@link https://anthony0br.github.io/DocumentService/api/SaveUtil#uuid}
   */
  uuid(): string;
  /**
   * A wrapper for UpdateAsync that retries with exponential backoff, prevents use of the throttle 'queue', and allows
   * retries to be aborted.
   *
   * @see {@link https://anthony0br.github.io/DocumentService/api/SaveUtil#updateAsync}
   */
  updateAsync(
    transform: (
      value: LuaTuple<[callback: (err: string) => void, unknown, DataStoreKeyInfo]>,
    ) => LuaTuple<[unknown, number[]?, unknown?]>,
    dataStore: DataStoreInterface | DataStore,
    key: string,
  ): LuaTuple<[boolean, unknown, DataStoreKeyInfo]>;
  /**
   * A wrapper for GetAsync that retries with exponential backoff and prevents use of the throttle 'queue'.
   *
   * @see {@link https://anthony0br.github.io/DocumentService/api/SaveUtil#getAsync}
   */
  getAsync(dataStore: DataStoreInterface | DataStore, key: string): LuaTuple<[boolean, unknown, DataStoreKeyInfo]>;
  /**
   * A wrapper for RemoveAsync
   *
   * @see {@link https://anthony0br.github.io/DocumentService/api/SaveUtil#removeAsync}
   */
  removeAsync(dataStore: DataStoreInterface | DataStore, key: string): boolean;
}
