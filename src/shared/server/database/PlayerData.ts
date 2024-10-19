/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Opens a {@link DocumentService.DocumentStore} to {@link PlayerData}
 * @see {@link https://anthony0br.github.io/DocumentService/ DocumentService}
 */

import { defaultPlayerData, PlayerData } from "shared/modules/database/PlayerData";
import { DocumentStore } from "shared/modules/documentservice/DocumentService";
import Guard from "shared/modules/guard/Guard";

// const check = (v: unknown): PlayerData =>
//   Guard.Record({
//     foo: Guard.Boolean,
//     bar: Guard.Record({
//       foo: Guard.Or(Guard.And(Guard.Boolean, Guard.String), Guard.Number),
//       baz: Guard.Tuple(Guard.Number, Guard.String),
//       bang: Guard.List(Guard.String),
//     }),
//   })(v);

const check = (v: unknown): PlayerData => Guard.Record({})(v);

const dataStoreService = game.GetService("DataStoreService");

const playerDataDocumentStore = new DocumentStore<PlayerData>({
  dataStore: dataStoreService.GetDataStore("PlayerData"),
  check,
  default: defaultPlayerData,
  lockSessions: true,
  migrations: [],
});

export default playerDataDocumentStore;
