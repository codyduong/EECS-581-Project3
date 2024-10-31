/**
 * @author Cody Duong
 * @file This file exists to be copied into each enemy AI. In essence this is the enemy AI.
 */

import { path } from "game/modules/EnemySupervisor";
import { PathGenerator } from "game/modules/Path";

const connection = script.GetActor()!.BindToMessage("tick", () => {
  const actor = script.GetActor()!;
  // print(`AI ${actor.Name} is thinking`);

  const health = actor.GetAttribute("health");
  // const pos = actor.GetAttribute("position"); // todo audit usage? is this a useful attribute
  const speed = actor.GetAttribute("speed") as number;
  const goalNodeKey = actor.GetAttribute("goalNode") as Vector3;
  const modelOffset = actor.GetAttribute("modelOffset") as Vector3;

  // if any of these invariants failed, we failed to set them in EnemySupervisor
  assert(health !== undefined);
  assert(typeIs(health, "number"));
  // assert(pos !== undefined);
  //
  assert(speed !== undefined);
  assert(typeIs(speed, "number"));
  assert(goalNodeKey !== undefined);
  assert(typeIs(goalNodeKey, "Vector3"));
  assert(modelOffset !== undefined);
  assert(typeIs(modelOffset, "Vector3"));

  // TOOD we need to change this to the new model;
  const enemyModel = actor.FindFirstChildOfClass("Part");

  assert(enemyModel !== undefined);

  function cleanup() {
    connection.Disconnect();
    enemyModel!.Destroy();
    task.defer(() => {
      script.Parent?.Destroy();
    });
  }

  // find the direction we need to be going in;
  const currPos = enemyModel.Position;
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
    actor.SetAttribute("goalNode", goalNode!.pos);
  }

  const direction = goalPos.sub(currPos);
  let vector = direction.Unit.mul(speed);
  vector = vector.Magnitude < direction.Magnitude ? vector : direction; // clamp to lower bound, ie. prevent overshooting
  /** as an aside TODO: we shouldn't discard leftover "speed" from any overshoots, and instead it should be processed
   * to the next direction
   */
  const newPos = currPos.add(vector);
  task.synchronize();
  enemyModel.Position = newPos;
});
