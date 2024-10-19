import { defaultPlayerData, PlayerData } from "shared/modules/database/PlayerData";
import DocumentService from "shared/modules/documentservice/DocumentService";
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

const playerDataDocumentStore = new DocumentService.DocumentStore<PlayerData>({
  dataStore: dataStoreService.GetDataStore("PlayerData"),
  check,
  default: defaultPlayerData,
  lockSessions: true,
  migrations: [],
});

export default playerDataDocumentStore;
