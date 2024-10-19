/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Allows use of roblox-ts internals
 */

type Import = (...args: unknown[]) => Record<string, unknown>;

declare global {
  const TS: {
    import: Import;
  };
}

export {};
