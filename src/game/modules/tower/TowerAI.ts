/**
 * @author Cody Duong
 * @file This file exists to be copied into each tower AI. In essence this is tower enemy AI.
 *
 * Notably, this is not a module we export. Since code runs on module import, we don't want to run the code until
 * it is in an {@link Actor|Actor}. We manage the import of this in the `./index.ts`
 */

import Guard from "shared/modules/guard/Guard";
import { TowerStats } from "./Tower";

const _connection = script.GetActor()!.BindToMessageParallel("tick", (maybeTick) => {
  const tick = Guard.Number(maybeTick);
  const actor = script.GetActor()!;

  const _guid = Guard.String(actor.GetAttribute("guid"));
  const damage = Guard.Number(actor.GetAttribute("damage"));
  const ticksBetweenAttacks = Guard.Number(actor.GetAttribute("ticksBetweenAttacks"));
  const _attackType = Guard.Literal("raycast")(actor.GetAttribute("attackType")) satisfies TowerStats["attackType"];
  const range = Guard.Number(actor.GetAttribute("range"));
  const position = Guard.Vector3(actor.GetAttribute("Position"));
  const lastAttacked = Guard.Number(actor.GetAttribute("LastAttacked"));

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

  // sorted by name (which is incrementing, ie. 0, 1, 2...)
  const sortedEnemies = enemiesWithinRange.sort((a, b) => {
    const aNumber = Guard.Number(tonumber(a.Name, 10));
    const bNumber = Guard.Number(tonumber(b.Name, 10));

    return aNumber < bNumber;
  });

  const firstAliveEnemy = sortedEnemies.find((enemy) => Guard.Number(enemy.GetAttribute("health")) > 0)!;

  if (firstAliveEnemy === undefined) {
    return;
  }

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
  }

  // every tick always inform animator of where to point tower

  // give the position of the enemy to fire at
  task.synchronize();

  const animateEvent = actor.FindFirstChildOfClass("RemoteEvent");

  // in some scenarios animateEvent was deleted while AI was running (ex. if a AI thinks on tick 2, and deleted on tick 3,
  // it is very possible, this will run and fail, so use ? conditional chaining)
  animateEvent?.FireAllClients(Guard.Vector3(firstAliveEnemy.GetAttribute("Position")));

  // function cleanup(): void {
  //   connection.Disconnect();
  //   enemyModel!.Destroy();
  //   task.defer(() => {
  //     script.Parent?.Destroy();
  //   });
  // }
});
