import { Document, DocumentConstructor } from "./DocumentService.Document";
import { Migrations } from "./DocumentService.Types";

export interface DocumentStoreProps<T> {
  dataStore: DataStore; // The object returned by DataStoreService:GetDataStore()
  check: (...args: unknown[]) => T; // A type check function for your data, errors if types are invalid
  default: T & Record<string, any>; // Default values, which are set if keys are empty
  migrations: Migrations; // Migrations
  lockSessions: boolean; // Should the documents be session locked?
}

type DocumentStore<T> = {
  /**
   * Gets the document for the key given, or creates one if it does not exist.
   *
   * @param key
   * \
   * !INFO: Documents are cached in a weak table, so once they are closed, they will be marked for garbage collection if you have no references to them. Be careful of references created by closures.
   *
   * Documents that are not session locked will be garbage collected once there are no other references to them.
   */
  GetDocument(key: string): LuaTuple<[document: Document<T>, document_created: boolean]>;
  /**
   * !WARNING: Yields
   *
   * Closes all open documents as fast as possible. This runs on BindToClose already.
   *
   * Will also wait for any documents that are opening to open, and then close them.
   */
  CloseAllDocuments(): void;
};

interface DocumentStoreConstructor {
  new <T>(props: DocumentStoreProps<T>): DocumentStore<T>;
  isDocumentStore(i: unknown): i is DocumentStore<unknown>;
}

declare const Module: {
  DocumentStore: DocumentStoreConstructor;
  Document: DocumentConstructor;
};

export default Module;
