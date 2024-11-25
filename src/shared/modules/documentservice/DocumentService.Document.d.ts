/**
 * @prologue
 * @author Cody Duong <cody.qd@gmail.com>
 * @license MIT
 * @file Contains type definitions for {@link https://github.com/anthony0br/DocumentService/ DocumentService}
 *       This file is effectively a noop. It is used to provide type information about `\.lua(u)?` files to the
 *       compiler, but outputs no code.
 */

import {
  Result,
  RobloxAPIError,
  BackwardsCompatibilityError,
  CheckError,
  SessionLockedError,
  SchemaError,
  Transform,
  HookEvent,
} from "./DocumentService.Types";

/**
 * @see {@link https://anthony0br.github.io/DocumentService/api/Document/#OpenResult%3CT%3E}
 */
type OpenResult<T> = Result<T, RobloxAPIError | BackwardsCompatibilityError | CheckError | SessionLockedError>;

/**
 * @see {@link https://anthony0br.github.io/DocumentService/api/Document/#WriteResult%3CT%3E}
 */
type WriteResult<T> = Result<T, RobloxAPIError | SessionLockedError | SchemaError>;

/**
 * An abstraction over keys in a DataStore.
 *
 * Documents are designed to contain information about an entity in a schema. This schema is enforced by your check
 * function, and should be changed through migrations. You may, of course, decide to not use a schema by defining an
 * empty check function, but this generally isn't recommended.
 *
 * @note TIP: Session locking prevents your data from being edited by mutliple servers, and ensures one server is
 * finished with it before it is opened by another. In DocumentService, session locking enables the use of the caching
 * methods `SetCache` and `GetCache`. This is ideal for player data, or any data that needs frequent updates and does
 * not need multi-server editing.
 * @note WARNING: You are free to edit the contents of the table in the .data field with a tool like DataStore Editor,
 * but manually changing other fields could cause data loss and errors.
 * @note WARNING: Types for your data are provided under the assumption that once a document is opened, the underlying
 * data held in Data Stores is not updated externally in a way that changes its type.
 *
 * @see {@link https://anthony0br.github.io/DocumentService/api/Document}
 */
export type Document<T> = {
  /**
   * Validates the document if one exists, creates a default document if no document exists, or creates a document with
   * the data that is in the given key if the key hasn't been used with DocumentService before.
   *
   * Opening a session-locked document will enable periodic autosaves until it is closed.
   *
   * You must open a document before reading or writing to it.
   *
   * @note Yields
   * @note INFO: If the document is locked by another session, this method will wait and retry up to 5 times, and yields
   * until the retries are exhausted or the lock is removed. Therefore, you should not use this method to check if the
   * Document is being used by another session.
   * @note WARNING: You should check the value of success, and handle failures by checking the value of `reason`. The
   * possible `reason`s for each method are defined in the return type.
   *
   * @see
   * {@link https://anthony0br.github.io/DocumentService/api/Document/#Open}
   */
  Open(): OpenResult<T>;
  /**
   * Opens, and also runs a transform function on the data. Useful for non-session-locked data for shared entities,
   * where one-off updates might be needed. Will throw a Luau error if the transform produces invalid or unsavable data.
   *
   * Runs both Open and Update hooks, including fail hooks.
   *
   * @note Yields
   *
   * @see
   * {@link https://anthony0br.github.io/DocumentService/api/Document/#OpenAndUpdate}
   */
  OpenAndUpdate(transform: Transform<T>): OpenResult<T>;
  /**
   * Marks the lock as stolen. The next {@link Document.Open|`.Open`} call will ignore any existing locks.
   *
   * @note Yields
   * @note INFO: Generally, it is recommended to call {@link Document.Steal|`.Steal`} and then
   * {@link Document.Open|`.Open`} in the case that the initial {@link Document.Open|`.Open`} fails due to
   * {@link SessionLockedError|`SessionLockedError`}.
   * @note WARNING: Do not use this unless you are very sure the previous session is dead, or you could cause data loss.
   * Only usable on session-locked Documents.
   *
   * @see
   * {@link https://anthony0br.github.io/DocumentService/api/Document/#Steal}
   */
  Steal(): void;
  /**
   * Returns a false Result if Document is currently open, locked by another session, otherwise returns a true Result.
   *
   * If props.lockSessions is false, this will always return a true Result.
   *
   * @note Yields
   *
   * @see {@link https://anthony0br.github.io/DocumentService/api/Document/#Steal}
   */
  IsOpenAvailable(): Result<boolean, RobloxAPIError>;
  /**
   * Returns whether the document is open or not
   *
   * @see {@link https://anthony0br.github.io/DocumentService/api/Document/#IsOpen}
   */
  IsOpen(): boolean;
  /**
   * Closes the document, so it cannot be edited.
   *
   * The document must be open before using this method.
   *
   * If session locked, will save the document, remove the lock, and cancel autosaves first. If this fails, the document
   * will not be closed.
   *
   * @note Yields
   *
   * @see {@link https://anthony0br.github.io/DocumentService/api/Document/#Close}
   */
  Close(): WriteResult<T>;
  /**
   * Returns true if {@link Document.Close|`Close`} has been called and is incomplete.
   *
   * @see {@link https://anthony0br.github.io/DocumentService/api/Document/#IsClosing}
   */
  IsClosing(): boolean;
  /**
   * Sets the cache.
   *
   * The document must be open before using this method. You can only use cache for session-locked data.
   *
   * @note WARNING: Your cache should always pass your check function, otherwise autosaves may error.
   * @note INFO: You must use immutable operations on cache, i.e. clone any table you intend to edit.
   *
   * @see {@link https://anthony0br.github.io/DocumentService/api/Document/#SetCache}
   */
  SetCache(newCache: T): T;
  /**
   * Retrieves the cache.
   *
   * The document must be open before using this method. You can only use cache for session-locked data.
   *
   * @note INFO: You must use immutable operations on cache, i.e. clone any table you intend to edit.
   *
   * @see {@link https://anthony0br.github.io/DocumentService/api/Document/#GetCache}
   */
  GetCache(): T;
  /**
   * Performs an atomic transaction on the Document, writing to the DataStore.
   *
   * The document must be open before using this method.
   *
   * If using session locking, transforms will build on cached data.
   *
   * Throws if data is not storable or the transform return value is invalid.
   *
   * @note TIP: Due to Luau limitations with the old solver, you will get the best experience if you manually annotate
   * the type of the transform parameter.
   * @note WARNING: The transform function must not yield, and shouldn't rely on any data from outside. It must follow
   * the rules of what is storable in Data Stores.
   * @note WARNING: Assumes the data that is already in Data Stores is valid since the last
   * {@link Document.Open|`.Open`}. If it isn't, and this is not corrected by the transform, this method will throw a
   * luau error.
   * @note WARNING: If you are using session locking, your transform needs to use immutable operations (in the same way
   * updating cache does).
   * @note WARNING: If your transform errors, the update will be aborted and the error will be thrown in a new thread
   * (this is Roblox behaviour).
   * @note INFO: Unlike {@link Document.Open|`Open`}, this method will not retry if the lock is stolen, and will instead
   * return a {@link SessionLockedError|`SessionLockedError`} after the first attempt.
   *
   * @see {@link https://anthony0br.github.io/DocumentService/api/Document/#Update}
   */
  Update(transform: Transform<T>): WriteResult<T>;
  /**
   * Saves a Document's cache to its DataStore. Equivalent to calling Update without transforming the data.
   *
   * The document must be open and locked to use this method.
   *
   * @note Yields
   *
   * @see {@link https://anthony0br.github.io/DocumentService/api/Document/#Save}
   */
  Save(): WriteResult<T>;
  /**
   * Erases all data associated with the key.
   *
   * The document must not be open. It is up to you to check if the document is open elsewhere, e.g. via
   * {@link Document.IsOpenAvailable|`IsOpenAvailable`}.
   *
   * Satisfies compliance with GDPR right of erasure.
   *
   * Does not run hooks.
   *
   * @note Yields
   *
   * @see {@link https://anthony0br.github.io/DocumentService/api/Document/#Erase}
   */
  Erase(): Result<undefined, RobloxAPIError>;
  /**
   * Reads the latest data stored in Data Stores.
   *
   * Runs migrations and the check function, but does not save changes.
   *
   * This may be called while the document is not open.
   *
   * Runs Read hooks.
   *
   * @note WARNING: A {@link SchemaError|`SchemaError`} will be returned if document has never been opened before, so it
   * is strongly recommended to handle this case, and Open the document before reading it if possible. This includes
   * when migrating from no library.
   *
   * @see {@link https://anthony0br.github.io/DocumentService/api/Document/#Read}
   */
  Read(): Result<any, RobloxAPIError | SchemaError | CheckError | BackwardsCompatibilityError>;
  /**
   * Attaches a hook which occurs before the event.
   *
   * Note that if a hook yields, it will yield all methods that call it. Hooks are called in the order they are added.
   *
   * Hooks cannot currently mutate arguments.
   *
   * @see {@link https://anthony0br.github.io/DocumentService/api/Document/#HookBefore}
   */
  HookBefore(event: HookEvent, hook: () => void): () => void;
  /**
   * Attaches a hook which occurs after the event, before the method returns.
   *
   * Note that if a hook yields, it will yield all methods that call it. Hooks are called in the order they are added.
   *
   * Hooks added with HookAfter only run if the operation is successful, and cannot mutate the result.
   *
   * @see {@link https://anthony0br.github.io/DocumentService/api/Document/#HookAfter}
   */
  HookAfter(event: HookEvent, hook: () => void): () => void;
  /**
   * Attaches a hook which occurs after an event fails.
   *
   * Note that fail hooks only run when a method returns an Err type. They will not run if the method throws a Luau
   * error due to incorrect usage.
   *
   * @see {@link https://anthony0br.github.io/DocumentService/api/Document/#HookFail}
   */
  HookFail(event: HookEvent, hook: () => void): () => void;
  /**
   * Attaches a single-use hook which occurs before the event.
   *
   * @see {@link https://anthony0br.github.io/DocumentService/api/Document/#OnceBefore}
   */
  OnceBefore(event: HookEvent, hook: () => void): void;
  /**
   * Attaches a single-use hook which occurs after the event, before the method returns.
   *
   * @see {@link https://anthony0br.github.io/DocumentService/api/Document/#OnceAfter}
   */
  OnceAfter(event: HookEvent, hook: () => void): void;
  /**
   * Attaches a single-use hook which occurs after an event fails.
   *
   * @see {@link https://anthony0br.github.io/DocumentService/api/Document/#OnceFail}
   */
  OnceFail(event: HookEvent, hook: () => void): void;
};

/**
 * @see {@link Document}
 */
export interface DocumentConstructor {
  /**
   * Checks if a metatable passed is a Document.
   *
   * @see {@link https://anthony0br.github.io/DocumentService/api/Document/#isDocument}
   */
  isDocument(o: unknown): o is Document<unknown>;
}
