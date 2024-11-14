/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Contains type definitions for {@link https://util.redblox.dev/guard.html red-blox/guard}
 */

export type Check<T> = (Value: any) => T;

/**
 * @see {@link https://util.redblox.dev/guard.html}
 */
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
  Literal<const T>(this: void, check: T): Check<T>;
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
  Check<T extends (Value: any) => any>(this: void, check: T): (Value: unknown) => [pass: boolean, value: ReturnType<T>];
  // these are not part of the default library. Read the Guard.luau for implementation details
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
  Union<T extends [...Check<any>[]]>(
    this: void,
    tuples: T,
  ): Check<{ [I in keyof T]: T[I] extends Check<infer U> ? U : unknown }[number]>;
  Union<T extends [...Check<any>[]]>(
    this: void,
    ...tuples: T
  ): Check<{ [I in keyof T]: T[I] extends Check<infer U> ? U : unknown }[number]>;
  Function: Check<(...args: unknown[]) => unknown>;
  NonNil<T>(this: void, Value: T): NonNullable<T>;
};

export default Module;
