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
import { TowerStats } from "./Tower";

/**
 * The core AI function. Is triggered whenever the `TowerSupervisor` deems an AI to "think".
 *
 * @note Runs on [Parallel Lua]{@link https://create.roblox.com/docs/scripting/multithreading} for speed.
 * @sideeffect As long as {@link event} exists will run whenever queried for an animation. Automatically cleaned up.
 *             AI has a side-effect of repositioning enemy on the server which is always retained. Action propogated to
 *             client via `./TowerAnimation.server.ts`
 */
const _connection = script.GetActor()!.BindToMessageParallel(
  "tick",
  /**
   * @param maybeTick Maybe a number corresponding to the game tick
   * @throws Errors if {@link maybeTick} is not a {@link number}, or if precondition fails
   */
  (maybeTick) => {
    const tick = Guard.Number(maybeTick);
    const actor = script.GetActor()!;

    const _guid = Guard.String(actor.GetAttribute("guid"));
    const damage = Guard.Number(actor.GetAttribute("damage"));
    const ticksBetweenAttacks = Guard.Number(actor.GetAttribute("ticksBetweenAttacks"));
    const _attackType = Guard.Literal("raycast")(actor.GetAttribute("attackType")) satisfies TowerStats["attackType"];
    const range = Guard.Number(actor.GetAttribute("range"));
    const position = Guard.Vector3(actor.GetAttribute("Position"));
    const lastAttacked = Guard.Number(actor.GetAttribute("LastAttacked"));
    // const pendingDmg = Guard.NumberMin(0)(actor.GetAttribute("PendingDmg"));

    // print(`Tower: ${guid} is thinking`); // <-- I/O actually causes significant latency

    const enemiesWithinRange = Guard.NonNil(game.Workspace.FindFirstChild("EnemyFolder"))
      .GetChildren()
      .filter((child): child is Actor => {
        assert(classIs(child, "Actor"));
        const enemyPosition = Guard.Vector3(child.GetAttribute("Position"));
        const magnitude = math.abs(position.sub(enemyPosition).Magnitude);

        if (magnitude <= range) {
          return true;
        }

        return false;
      });

    if (enemiesWithinRange.size() === 0) {
      return;
    }

    // this needs to be synchronized when we determine enemy for targetting, otherwise async means unpredictable
    task.synchronize();

    const sortedEnemies = enemiesWithinRange.sort((a, b) => {
      const aNumber = Guard.Number(a.GetAttribute("distanceTravelled"));
      const bNumber = Guard.Number(b.GetAttribute("distanceTravelled"));

      return aNumber > bNumber;
    });

    const firstAliveEnemy = sortedEnemies.find((enemy) => Guard.Number(enemy.GetAttribute("health")) > 0)!;

    if (firstAliveEnemy === undefined) {
      return;
    }

    let attacked = false;

    if (tick > lastAttacked + ticksBetweenAttacks) {
      actor.SetAttribute("LastAttacked", tick);
      let enemyHealth = Guard.Number(firstAliveEnemy.GetAttribute("health"));
      assert(enemyHealth > 0);

      const newHealth = enemyHealth - damage;
      // print("attacking", _guid, firstAliveEnemy, lastAttacked, ticksBetweenAttacks, tick, enemyHealth, newHealth);
      if (newHealth <= 0) {
        firstAliveEnemy.Destroy();
      }
      firstAliveEnemy.SetAttribute("health", newHealth);

      attacked = true;
    }

    // every tick always inform animator of where to point tower

    const animateEvent = actor.FindFirstChildOfClass("RemoteEvent");

    // in some scenarios animateEvent was deleted while AI was running (ex. if a AI thinks on tick 2, and deleted on tick 3,
    // it is very possible, this will run and fail, so use ? conditional chaining)
    animateEvent?.FireAllClients(attacked, Guard.Vector3(firstAliveEnemy.GetAttribute("Position")));
  },
);
