export function findFirstSibling(instance: Instance, siblingName: string): Instance | undefined {
  return instance.Parent?.FindFirstChild(siblingName);
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
