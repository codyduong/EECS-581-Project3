/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Utility functions
 */

/**
 * Finds the first sibling given an instance
 * @param {instance} instance instance to find sibling of
 * @param {string} siblingName {@link https://create.roblox.com/docs/reference/engine/classes/Instance#Name Name} of the
 * sibling
 * @param {string} [siblingClass] {@link Instances ClassName} of the sibling
 */
export function findFirstSibling(instance: Instance, siblingName: string, siblingClass?: undefined): unknown;
export function findFirstSibling<T extends Instances[keyof Instances]>(
  instance: Instance,
  siblingName: string,
  siblingClass: keyof { [K in keyof Instances as Instances[K] extends T ? K : never]: unknown },
): T;
export function findFirstSibling<T extends Instances[keyof Instances]>(
  instance: Instance,
  siblingName: string,
  siblingClass?: keyof Instances,
): unknown {
  return instance.Parent?.GetChildren().find((v) => {
    if (v.Name !== siblingName) {
      return false;
    }
    if (siblingClass && !v.IsA(siblingClass)) {
      return false;
    }
    return true;
  }) as unknown as (T extends Instances[keyof Instances] ? unknown : T) | undefined;
}

/**
 * Retrieve true if we are running on the server
 * @returns {boolean}
 */
export function isClient(): boolean {
  return game.GetService("RunService").IsClient();
}

/**
 * Errors if the script that runs this is not on the client
 * @throws
 */
export function assertClient(): void {
  assert(isClient(), "Expected to be run on the client");
}

/**
 * Retrieve true if we are running on the server
 * @returns {boolean}
 */
export function isServer(): boolean {
  return game.GetService("RunService").IsServer();
}

/**
 * Errors if the script that runs this is not on the server
 * @throws
 */
export function assertServer(): void {
  assert(isServer(), "Expected to be run on the server");
}
