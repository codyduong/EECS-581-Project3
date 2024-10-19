/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Contains type definitions for {@link https://github.com/anthony0br/DocumentService/ DocumentService}
 */

import { Document } from "./DocumentService.Document";
import { Migrations } from "./DocumentService.Types";

export interface DocumentStoreProps<T> {
  dataStore: DataStore; // The object returned by DataStoreService:GetDataStore()
  check: (...args: unknown[]) => T; // A type check function for your data, errors if types are invalid
  default: T & Record<string, any>; // Default values, which are set if keys are empty
  migrations: Migrations; // Migrations
  lockSessions: boolean; // Should the documents be session locked?
}

/**
 * Represents a collection of Documents, analagous to a DataStore.
 *
 * @note WARNING: Multiple DocumentStores can be created for the same DataStore. You should avoid this, as they will
 * return different Document objects in different sessions. If you need to access the same DocumentStore in multiple
 * scripts, create a module and require that module. Do not use DocumentService with Actors or Parallel Luau.
 */
type DocumentStore<T> = {
  /**
   * Gets the document for the key given, or creates one if it does not exist.
   *
   * @note INFO: Documents are cached in a weak table, so once they are closed, they will be marked for garbage
   * collection if you have no references to them. Be careful of references created by closures.
   *
   * Documents that are not session locked will be garbage collected once there are no other references to them.
   *
   * @see {@link https://anthony0br.github.io/DocumentService/api/DocumentStore#GetDocument}
   */
  GetDocument(key: string): LuaTuple<[document: Document<T>, document_created: boolean]>;
  /**
   * Closes all open documents as fast as possible. This runs on BindToClose already.
   *
   * Will also wait for any documents that are opening to open, and then close them.
   *
   * Closes documents asynchronously when request budget allows, and yields all open documents are closed.
   *
   * @note Yields
   * @note WARNING: Yields until all documents are closed. If there is a systematic error in your :Close, for example a
   * hook errors, this could infinitely yield.
   *
   * @see {@link https://anthony0br.github.io/DocumentService/api/DocumentStore#CloseAllDocuments}
   */
  CloseAllDocuments(): void;
};

/**
 * @see {@link DocumentStore}
 */
interface DocumentStoreConstructor {
  /**
   * Creates a new DocumentStore.
   *
   * @note WARNING: This should only be called once per server for each DataStore in a live game. If there are multiple
   * instances of a DocumentStore for one key, any Documents will be treated as if they are from different sessions.
   * This is useful for unit testing but can lead to weird bugs in production. DocumentStores should persist through an
   * entire server's lifespan and are not garbage collected.
   *
   * @see {@link https://anthony0br.github.io/DocumentService/api/DocumentStore#new}
   */
  new <T>(props: DocumentStoreProps<T>): DocumentStore<T>;
  /**
   * Checks if a metatable passed is a DocumentStore.
   *
   * @see {@link https://anthony0br.github.io/DocumentService/api/DocumentStore#isDocumentStore}
   */
  isDocumentStore(i: unknown): i is DocumentStore<unknown>;
}
