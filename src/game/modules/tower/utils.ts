export function calculateTicksToIntercept(enemyDistance: number, projectileSpeed: number, style: "flat"): number;
export function calculateTicksToIntercept(
  enemyDistance: number,
  projectileSpeed: number,
  style: "flat" | "curved",
  towerRange: number,
): number;
export function calculateTicksToIntercept(
  enemyDistance: number,
  projectileSpeed: number,
  style: "flat" | "curved",
  towerRange?: number,
): number {
  if (style === "flat") {
    return enemyDistance / projectileSpeed;
  } else {
    assert(towerRange !== undefined);
    return enemyDistance / ((0.4 * (enemyDistance / towerRange) + 0.8) * projectileSpeed);
  }
}
