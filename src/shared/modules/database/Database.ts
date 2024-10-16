/**
 * Wrapper around DocumentService to provide events to client
 */

import DocumentService from "shared/modules/documentservice/DocumentService";
import { check, DataSchema } from "./DataScheme";

const foo = DocumentService.DocumentStore;
const bar = new foo<DataSchema>({
  dataStore: game.GetService("DataStoreService").GetDataStore("itemors"),
  check,
  default: {
    coins: 0,
  },
  lockSessions: true,
  migrations: [],
});
const userId = game.GetService("Players").PlayerAdded.Connect((player) => {
  const userId = player.UserId;
  const document = bar.GetDocument(`${userId}`)[0];
  print(userId, document);
  document.Steal();
  document.Open();
  // const data = document.Update(() => {
  //   return {
  //     coins: 0,
  //   };
  // });
  // document.Save();
  // const data2 = document.Read();
  // print(data, data2);
});
