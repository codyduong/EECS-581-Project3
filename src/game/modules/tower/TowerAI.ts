/**
 * @prologue
 *
 * @author Cody Duong
 *
 * @file Handles tower AI. This file is meta-exported in `./index.ts` which is then used in
 *       [TowerSupervisor]{@link TowerSupervisor}.
 *
 * @precondition Is a child of {@link Actor}
 *
 * @postcondition N/A
 *
 * @invariant N/A
 *
 * @throws Errors is if precondition is not met (ie. fails to execute)
 *
 * @sideeffect See {@link _connection}
 *
 * @revisions
 * [2024.November.11]{@revision Initial creation to support tower attacks}
 * [2024.November.18]{@revision Improve prologue and inline comments (no logical changes)}
 * [2024.November.27]{@revision Add initial attack animation indicator (simple debug laser)}
 * [2024.December.2]{@revision Fix targeting to use furthest along rather than oldest}
 */

import Guard from "shared/modules/guard/Guard";
import { ATTACK_TYPE_GUARD } from "./Tower";
import { path } from "game/modules/EnemySupervisor";
import { PathGenerator } from "game/modules/Path";
import { TICKS_PER_SECOND } from "game/modules/consts";
import { calculateTicksToIntercept } from "./utils";

function calculateFuturePosition(
  enemy: Actor,
  towerPosition: Vector3,
  projectileSpeed: number,
  towerRange: number,
): Vector3 | undefined {
  const speed = Guard.Number(enemy.GetAttribute("speed"));
  const modelOffset = Guard.Vector3(enemy.GetAttribute("modelOffset"));
  const currPos = Guard.Vector3(enemy.GetAttribute("Position"));
  const goalNodeKey = Guard.Vector3(enemy.GetAttribute("goalNode"));

  // Path and goal management
  let goalNode = path.get(PathGenerator.vector3ToKey(goalNodeKey));
  if (goalNode === undefined) {
    return undefined; // If there's no valid path, we can't calculate future position
  }

  let currentPosition = currPos;
  let remainingTime = 0;

  while (true) {
    const goalPos = goalNode.pos.add(modelOffset);
    const direction = goalPos.sub(currentPosition);
    const distanceToGoal = direction.Magnitude;

    // Time to reach this node
    const timeToGoal = distanceToGoal / speed;

    // Time to intersect with projectile
    const distanceToTower = currentPosition.sub(towerPosition).Magnitude;

    // If we are outside the range then ignore
    if (distanceToTower > towerRange) {
      return undefined;
    }

    // projectiles go faster the further the enemy is, from [0.8, 1.2] base speed
    const timeToIntercept = calculateTicksToIntercept(distanceToTower, projectileSpeed, "curved", towerRange);

    // If intercept happens before reaching the goal
    if (remainingTime + timeToGoal >= timeToIntercept) {
      const interpolatedPosition = currentPosition.add(direction.Unit.mul((timeToIntercept - remainingTime) * speed));
      return interpolatedPosition;
    }

    // Move to the next node
    currentPosition = goalPos;
    remainingTime += timeToGoal;

    const nextNodeKey = goalNode.next[0]; // Assuming only one path; handle branching as needed
    goalNode = path.get(nextNodeKey);
    if (goalNode === undefined) {
      return undefined; // Reached the end of the path, no intercept possible
    }
  }
}

function calculateFuturePosNTicks(enemy: Actor, ticks: number): Vector3 | undefined {
  const speed = Guard.Number(enemy.GetAttribute("speed"));
  const modelOffset = Guard.Vector3(enemy.GetAttribute("modelOffset"));
  const currPos = Guard.Vector3(enemy.GetAttribute("Position"));
  const goalNodeKey = Guard.Vector3(enemy.GetAttribute("goalNode"));

  let goalNode = path.get(PathGenerator.vector3ToKey(goalNodeKey));
  if (goalNode === undefined) {
    return undefined; // If no valid path exists, return undefined
  }

  let remainingTime = ticks;
  let currentPosition = currPos;

  while (remainingTime > 0) {
    const goalPos = goalNode.pos.add(modelOffset);
    const direction = goalPos.sub(currentPosition);
    const distanceToGoal = direction.Magnitude;

    // Time to reach the current goal node
    const timeToGoal = distanceToGoal / speed;

    if (remainingTime <= timeToGoal) {
      // If we can reach the target position within the remaining time
      const interpolatedPosition = currentPosition.add(direction.Unit.mul(remainingTime * speed));
      return interpolatedPosition;
    }

    // If not, move to the goal node and update remaining time
    currentPosition = goalPos;
    remainingTime -= timeToGoal;

    const nextNodeKey = goalNode.next[0]; // Assuming only one path; handle branching if needed
    goalNode = path.get(nextNodeKey);
    if (goalNode === undefined) {
      return currentPosition; // If no further nodes exist, return the current position
    }
  }

  return currentPosition;
}

const tower = script.GetActor()!;

/**
 * The core AI function. Is triggered whenever the `TowerSupervisor` deems an AI to "think".
 *
 * @note Runs on [Parallel Lua]{@link https://create.roblox.com/docs/scripting/multithreading} for speed.
 * @sideeffect As long as {@link event} exists will run whenever queried for an animation. Automatically cleaned up.
 *             AI has a side-effect of repositioning enemy on the server which is always retained. Action propogated to
 *             client via `./TowerAnimation.server.ts`
 */
const _connection = tower.BindToMessageParallel(
  "tick",
  /**
   * @param maybeTick Maybe a number corresponding to the game tick
   * @throws Errors if {@link maybeTick} is not a {@link number}, or if precondition fails
   */
  (maybeTick) => {
    const tick = Guard.Number(maybeTick);

    const _guid = Guard.String(tower.GetAttribute("guid"));
    const damage = Guard.Number(tower.GetAttribute("damage"));
    const ticksBetweenAttacks = Guard.Number(tower.GetAttribute("ticksBetweenAttacks"));
    const attackType = ATTACK_TYPE_GUARD(tower.GetAttribute("attackType"));
    const range = Guard.Number(tower.GetAttribute("range"));
    const position = Guard.Vector3(tower.GetAttribute("Position"));
    const lastAttacked = Guard.Number(tower.GetAttribute("lastAttacked"));
    const [hasProjectileSpeed, projectileSpeed] = Guard.Check(Guard.Number)(tower.GetAttribute("bombSpeed"));

    // print(`Tower: ${guid} is thinking`); // <-- I/O actually causes significant latency

    const aliveEnemiesInRange = Guard.NonNil(game.Workspace.FindFirstChild("EnemyFolder"))
      .GetChildren()
      .mapFiltered<[Actor, futurePosition: Vector3 | undefined] | undefined>((enemy) => {
        assert(classIs(enemy, "Actor"));
        const enemyPosition = Guard.Vector3(enemy.GetAttribute("Position"));

        let futurePosition: Vector3 | undefined = undefined;
        if (attackType === "bomb") {
          assert(hasProjectileSpeed);
          futurePosition = calculateFuturePosition(enemy, position, projectileSpeed, range);
          if (!futurePosition) {
            return undefined;
          }

          if (position.sub(futurePosition).Magnitude > range) {
            return undefined;
          }
        } else {
          const magnitude = math.abs(position.sub(enemyPosition).Magnitude);

          if (magnitude > range) {
            return undefined;
          }
        }

        const health = Guard.Number(enemy.GetAttribute("health"));
        const pendingDmg = Guard.Number(enemy.GetAttribute("pendingDmg"));

        if (health <= 0 || health - pendingDmg <= 0) {
          return undefined;
        }

        return [enemy, futurePosition];
      });

    if (aliveEnemiesInRange.size() === 0) {
      return;
    }

    const sortedEnemies = aliveEnemiesInRange.sort((a, b) => {
      const aNumber = Guard.Number(a[0].GetAttribute("distanceTravelled"));
      const bNumber = Guard.Number(b[0].GetAttribute("distanceTravelled"));

      return aNumber > bNumber;
    });

    const [firstAliveEnemy, maybeFuturePos] = sortedEnemies[0];

    if (firstAliveEnemy === undefined) {
      return;
    }

    let attacked = false;

    // this needs to be synchronized when we determine enemy for targetting, otherwise async means unpredictable
    task.synchronize();

    // we need to calculate where the enemy will be
    const futurePosition = maybeFuturePos ?? Guard.Vector3(firstAliveEnemy.GetAttribute("Position"));

    if (tick > lastAttacked + ticksBetweenAttacks) {
      tower.SetAttribute("lastAttacked", tick);
      const enemyHealth = Guard.Number(firstAliveEnemy.GetAttribute("health"));
      // assert(enemyHealth > 0);
      if (enemyHealth <= 0) {
        return;
      }

      // if we are using a delayed method, instead set to pendingDmg
      if (attackType === "bomb") {
        const projectileSpeed = Guard.Number(tower.GetAttribute("bombSpeed"));
        const bombRange = Guard.Number(tower.GetAttribute("bombRange"));
        const ticksToIntercept = position.sub(futurePosition).Magnitude / projectileSpeed;
        // there is a bug given that some enemies don't exist yet, and therefore we don't properly propogate splash damage
        // @todo fix
        const otherEnemiesInBlast = Guard.NonNil(game.Workspace.FindFirstChild("EnemyFolder"))
          .GetChildren()
          .filter((maybeInBlast): maybeInBlast is Actor => {
            assert(classIs(maybeInBlast, "Actor"));
            // don't include the existing target
            if (maybeInBlast.Name === firstAliveEnemy.Name) {
              return false;
            }
            const otherEnemyFuturePos = calculateFuturePosNTicks(maybeInBlast, ticksToIntercept);
            if (otherEnemyFuturePos === undefined) {
              return false;
            }
            if (otherEnemyFuturePos.sub(futurePosition).Magnitude > bombRange) {
              return false;
            }
            return true;
          });

        // notably we have to calculate enemies nearby the impact point will take damage (if any)
        // firstAliveEnemy.SetAttribute("pendingDmg", damage);
        otherEnemiesInBlast.forEach((a) => {
          a.SetAttribute("PendingDmg", damage);
        });
        // we want to use game to deal damage this way, since there is a chance for the tower to be deleted while
        // projectiles are in flight
        const projectileTimeToIntercept = ticksToIntercept * (1 / TICKS_PER_SECOND);
        task.delay(projectileTimeToIntercept, () => {
          // this gurantees damage is dealt regardless of whether the enemy takes other actions... (ie. assumes it doesn't)
          // change velocity, this could be problematic for if the tower "misses"
          tower.SendMessage("DealDelayedDamage", firstAliveEnemy.Name, damage);
          otherEnemiesInBlast.forEach((a) => {
            tower.SendMessage("DealDelayedDamage", a.Name, damage);
          });
        });
      } else {
        const newHealth = enemyHealth - damage;
        // print("attacking", _guid, firstAliveEnemy, lastAttacked, ticksBetweenAttacks, tick, enemyHealth, newHealth);
        firstAliveEnemy.SetAttribute("health", newHealth);
      }

      attacked = true;
    }

    // every tick always inform animator of where to point tower
    const animateEvent = tower.FindFirstChildOfClass("RemoteEvent");

    // in some scenarios animateEvent was deleted while AI was running (ex. if a AI thinks on tick 2, and deleted on tick 3,
    // it is very possible, this will run and fail, so use ? conditional chaining)
    animateEvent?.FireAllClients(attacked, futurePosition);
  },
);

tower.BindToMessageParallel("DealDelayedDamage", (maybeEnemyName, maybeDmg) => {
  // print(`dealt delayed to ${maybeEnemyName}: ${maybeDmg}`);
  const enemyName = `${Guard.Number(tonumber(maybeEnemyName, 10))}`;
  const dmg = Guard.Number(maybeDmg);

  const enemy = Guard.NonNil(game.Workspace.FindFirstChild("EnemyFolder"))
    .GetChildren()
    .find((v): v is Actor => v.Name === enemyName && classIs(v, "Actor"));

  if (!enemy) {
    return;
  }

  task.synchronize();
  const pendingDmg = Guard.Number(enemy.GetAttribute("pendingDmg"));
  enemy.SetAttribute("pendingDmg", pendingDmg - dmg);
  const health = Guard.Number(enemy.GetAttribute("health"));
  enemy.SetAttribute("health", health - dmg);
});
