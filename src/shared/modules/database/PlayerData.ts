import DocumentService from "shared/modules/documentservice/DocumentService";
import { assertServer, isServer } from "shared/modules/utils";
import Guard from "shared/modules/guard/Guard";

export type PlayerData = {};
export const defaultPlayerData = {} satisfies PlayerData;

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

const playerDataDocumentStore = (() => {
  if (isServer()) {
    const dataStoreService = game.GetService("DataStoreService");
    return new DocumentService.DocumentStore<PlayerData>({
      dataStore: dataStoreService.GetDataStore("PlayerData"),
      check,
      default: defaultPlayerData,
      lockSessions: true,
      migrations: [],
    });
  } else {
    return undefined!;
  }
})();

export default playerDataDocumentStore;
