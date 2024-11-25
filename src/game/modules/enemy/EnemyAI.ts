/**
 * @prologue
 *
 * @author Cody Duong
 *
 * @file Handles tower AI. This file is meta-exported in `./index.ts` which is then used in
 *       [EnemySupervisor]{@link EnemySupervisor}.
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
 * [2024.November.4]{@revision Initial creation to support enemy movement}
 * [2024.November.11]{@revision Use {@link Actor.BindToMessageParallel} to improve performance}
 * [2024.November.24]{@revision Improve prologue and inline comments (no logical changes)}
 */

import { path } from "game/modules/EnemySupervisor";
import { PathGenerator } from "game/modules/Path";
import Guard from "shared/modules/guard/Guard";

const connection = script.GetActor()!.BindToMessageParallel("tick", () => {
  const actor = script.GetActor()!;

  const _health = Guard.Number(actor.GetAttribute("health"));
  const speed = Guard.Number(actor.GetAttribute("speed"));
  const goalNodeKey = Guard.Vector3(actor.GetAttribute("goalNode"));
  const modelOffset = Guard.Vector3(actor.GetAttribute("modelOffset"));
  const currPos = Guard.Vector3(actor.GetAttribute("Position"));

  // TOOD we need to change this to the new model;
  const enemyModel = actor.FindFirstChildOfClass("Model");
  assert(enemyModel !== undefined);

  function cleanup(): void {
    task.synchronize();
    connection.Disconnect();
    enemyModel!.Destroy();
    task.defer(() => {
      script.Parent?.Destroy();
    });
  }

  // find the direction we need to be going in;
  // const currPos = enemyModel.GetPivot().Position;
  let goalNode = path.get(PathGenerator.vector3ToKey(goalNodeKey));
  if (goalNode === undefined) {
    // this should never happen unless regeneration is done while AI is running. TODO rather than catch this behavior
    // here we should add a new function to cleanup enemyAI explicitly
    cleanup();
    return;
  }
  let goalPos = goalNode!.pos.add(modelOffset);

  // if we already hit our goal, go to our next goal
  if (currPos.FuzzyEq(goalPos)) {
    /* eslint-disable prettier/prettier */
      goalNode = path.get(goalNode!.next[0]); 
                                   // TODO, we only support going to the first branch, we need to add path splitting
                                   // but each AI only knows its internal state? do we choose randomly or do we want equal
                                   // splitting?
      /* eslint-enable */
    if (goalNode === undefined) {
      // we reached either a contradiction which should have been prevented from generating at all, or the end
      // TODO remove health from player
      cleanup();
      return;
    }
    goalPos = goalNode!.pos.add(modelOffset);
    task.synchronize();
    actor.SetAttribute("goalNode", goalNode!.pos);
    task.desynchronize();
  }

  const direction = goalPos.sub(currPos);
  let vector = direction.Unit.mul(speed);
  vector = vector.Magnitude < direction.Magnitude ? vector : direction; // clamp to lower bound, ie. prevent overshooting
  /** as an aside TODO: we shouldn't discard leftover "speed" from any overshoots, and instead it should be processed
   * to the next direction
   */
  const newPos = currPos.add(vector);
  // todo we shouldn't have this on the server at all.
  // enemyModel.PivotTo();
  task.synchronize();
  actor.SetAttribute("Position", newPos);

  const animateEvent = actor.FindFirstChildOfClass("RemoteEvent");

  // in some scenarios animateEvent was deleted while AI was running (ex. if a AI thinks on tick 2, and deleted on tick 3,
  // it is very possible, this will run and fail, so use ? conditional chaining)
  animateEvent?.FireAllClients(new CFrame(newPos).mul(enemyModel.GetPivot().Rotation));
});
