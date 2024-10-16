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

type OpenResult<T> = Result<T, RobloxAPIError | BackwardsCompatibilityError | CheckError | SessionLockedError>;

type WriteResult<T> = Result<T, RobloxAPIError | SessionLockedError | SchemaError>;

/**
 * This is the typescript def for this API.
 *
 * https://anthony0br.github.io/DocumentService/api/Document
 */
export type Document<T> = {
  Open(): OpenResult<T>;
  OpenAndUpdate(transform: Transform<T>): OpenResult<T>;
  Steal(): void;
  IsOpenAvailable(): Result<boolean, RobloxAPIError>;
  IsOpen(): boolean;
  Close(): WriteResult<T>;
  IsClosing(): boolean;
  SetCache(newCache: T): T;
  GetCache(): T;
  Update(transform: Transform<T>): WriteResult<T>;
  Save(): WriteResult<T>;
  Erase(): Result<undefined, RobloxAPIError>;
  Read(): Result<any, RobloxAPIError | SchemaError | CheckError | BackwardsCompatibilityError>;
  HookBefore(event: HookEvent, hook: () => void): () => void;
  HookAfter(event: HookEvent, hook: () => void): () => void;
  HookFail(event: HookEvent, hook: () => void): () => void;
  OnceBefore(event: HookEvent, hook: () => void): void;
  OnceAfter(event: HookEvent, hook: () => void): void;
  OnceFail(event: HookEvent, hook: () => void): void;
};

export interface DocumentConstructor {
  isDocument(o: unknown): o is Document<unknown>;
}
