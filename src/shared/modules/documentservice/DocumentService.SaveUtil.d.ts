import { DataStoreInterface } from "./DocumentService.Types";

export interface SaveUtil {
  assertStorable(data: unknown, fieldName?: string): void;
  uuid(): string;
  updateAsync(
    transform: (
      value: LuaTuple<[callback: (err: string) => void, unknown, DataStoreKeyInfo]>,
    ) => LuaTuple<[unknown, number[]?, unknown?]>,
    dataStore: DataStoreInterface | DataStore,
    key: string,
  ): LuaTuple<[boolean, unknown, DataStoreKeyInfo]>;
  getAsync(dataStore: DataStoreInterface | DataStore, key: string): LuaTuple<[boolean, unknown, DataStoreKeyInfo]>;
  removeAsync(dataStore: DataStoreInterface | DataStore, key: string): boolean;
}
