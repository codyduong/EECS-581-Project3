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
) {
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

// attempts to find first child deep. if it fails at any point returns undefined
export function ffcd(instance: Instance, ...childNames: (string | number)[]): Instance | undefined {
  let res = instance;
  for (const childName of childNames) {
    const t = res.FindFirstChild(childName);
    if (!t) {
      return undefined;
    }
    res = t;
  }
  return res;
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
 */
export function assertServer(): void {
  assert(isServer(), "Expected to be run on the server");
}
