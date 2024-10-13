export type HookEvent = "Open" | "Close" | "Update" | "Read"

export type Ok<T> = {
  success: true,
  data: T
}

export type Err<E> = {
  success: false,
  reason: E
  }

export type Result<T,E> = Ok<T> | Err<E>

export type RobloxAPIError = "RobloxAPIError"

export type SessionLockedError = "SessionLockedError"

export type CheckError = "CheckError"

export type BackwardsCompatibilityError = "BackwardsCompatibilityError"

export type SchemaError = "SchemaError"

export type Migrations = {
  backwardsCompatible: boolean,
  migrate: (data: any) => any,
}[]

export type Transform<T> = (data: T) => T

// export type 
