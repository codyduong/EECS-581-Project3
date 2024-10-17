/**
 * Typescript type declarations for Guard:
 * https://github.com/red-blox/util
 * https://util.redblox.dev/guard.html
 */

export type Check<T> = (Value: unknown) => T;

declare const Module: {
  Any: Check<unknown>;
  Boolean: Check<boolean>;
  Thread: Check<thread>;
  Nil: Check<undefined>;
  Number: Check<number>;
  String: Check<string>;
  Or<T, U>(this: void, left: Check<T>, right: Check<U>): Check<T | U>;
  And<T, U>(this: void, left: Check<T>, right: Check<U>): Check<T & U>;
  Optional<T>(this: void, check: Check<T>): Check<T | undefined>;
  Literal<T>(this: void, check: T): Check<T>;
  Map<K extends string | number | symbol, V>(
    this: void,
    key_check: Check<K>,
    value_check: Check<V>,
  ): Check<Record<K, V>>;
  Set<T extends string | number | symbol>(this: void, check: Check<T>): Check<Record<T, boolean>>;
  List<T>(this: void, check: Check<T>): Check<Array<T>>;
  Integer: Check<number>;
  NumberMin(this: void, min: number): Check<number>;
  NumberMax(this: void, max: number): Check<number>;
  NumberMinMax(this: void, min: number, max: number): Check<number>;
  CFrame: Check<CFrame>;
  Color3: Check<Color3>;
  DateTime: Check<DateTime>;
  Instance: Check<Instance>;
  Vector2: Check<Vector2>;
  Vector2int16: Check<Vector2int16>;
  Vector3: Check<Vector3>;
  Vector3int16: Check<Vector3int16>;
  Check<T>(this: void, check: Check<T>): LuaTuple<[pass: boolean, value: T]>;
  // this is not part of the default library. Read the Guard.luau for implementation details
  Record<T extends Record<string, Check<any>>>(
    this: void,
    object: T,
  ): Check<{ [K in keyof T]: T[K] extends Check<infer U> ? U : unknown }>;
  Tuple<T extends [...Check<any>[]]>(
    this: void,
    tuples: T,
  ): Check<{ [I in keyof T]: T[I] extends Check<infer U> ? U : unknown }>;
  Tuple<T extends [...Check<any>[]]>(
    this: void,
    ...tuples: T
  ): Check<{ [I in keyof T]: T[I] extends Check<infer U> ? U : unknown }>;
};

export default Module;
