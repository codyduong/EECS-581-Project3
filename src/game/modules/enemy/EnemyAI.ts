/**
 * @author Cody Duong
 * @file This file exists to be copied into each enemy AI. In essence this is the enemy AI.
 */

import { path } from "game/modules/EnemySupervisor";
import { PathGenerator } from "game/modules/Path";
// import Guard from "shared/modules/guard/Guard";
import { TICK_DELAY } from "game/modules/consts";

const connection = script.GetActor()!.BindToMessage("tick", (_maybeTickNo) => {
  // const tickNo = math.max(0, Guard.Number(maybeTickNo));
  const actor = script.GetActor()!;
  // print(`AI ${actor.Name} is thinking`);

  const health = actor.GetAttribute("health");
  // const pos = actor.GetAttribute("position"); // todo audit usage? is this a useful attribute
  const speed = actor.GetAttribute("speed") as number;
  const goalNodeKey = actor.GetAttribute("goalNode") as Vector3;
  const modelOffset = actor.GetAttribute("modelOffset") as Vector3;
  const currPos = actor.GetAttribute("Position") as Vector3;

  // if any of these invariants failed, we failed to set them in EnemySupervisor
  assert(health !== undefined);
  assert(typeIs(health, "number"));
  // assert(pos !== undefined);
  assert(speed !== undefined);
  assert(typeIs(speed, "number"));
  assert(goalNodeKey !== undefined);
  assert(typeIs(goalNodeKey, "Vector3"));
  assert(modelOffset !== undefined);
  assert(typeIs(modelOffset, "Vector3"));
  assert(currPos !== undefined);
  assert(typeIs(currPos, "Vector3"));

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
  }

  const direction = goalPos.sub(currPos);
  let vector = direction.Unit.mul(speed);
  vector = vector.Magnitude < direction.Magnitude ? vector : direction; // clamp to lower bound, ie. prevent overshooting
  /** as an aside TODO: we shouldn't discard leftover "speed" from any overshoots, and instead it should be processed
   * to the next direction
   */
  const newPos = currPos.add(vector);

  // TODO reenable? maybe... this should be better since we arent sending as many remote events, but it causes this
  // weird jittering effect. I think there is some accumulated error that becomes very visible, versus constantly correcting
  // for it... -@codyduong 2024-11-04

  // // Traverse and find the longest continuous segment in the same direction
  // let totalDistance = goalPos.sub(currPos).Magnitude;
  // let animationGoalNode = goalNode;
  // let nextNode = goalNode;

  // while (nextNode !== undefined && nextNode.next.size() === 1) {
  //   const nextGoalNode = path.get(nextNode.next[0]);
  //   if (!nextGoalNode) break;

  //   const segmentDirection = nextGoalNode.pos.sub(animationGoalNode.pos).Unit;

  //   // Check if the segment is in the same initial direction
  //   if (segmentDirection.Dot(direction) < 0.99) break;

  //   totalDistance += nextGoalNode.pos.sub(animationGoalNode.pos).Magnitude;
  //   animationGoalNode = nextGoalNode;
  //   nextNode = nextGoalNode;
  // }

  // // const animationGoalPos = animationGoalNode.pos.add(modelOffset);
  // const tickOffset = 10;
  // const timeToReach = (totalDistance - tickOffset * speed) / speed;
  // let animationGoalPos = currPos.add(direction.Unit.mul(timeToReach * speed));
  // animationGoalPos = new Vector3(
  //   math.round(animationGoalPos.X),
  //   math.round(animationGoalPos.Y),
  //   math.round(animationGoalPos.Z),
  // );

  task.synchronize();
  // const nextRunTime = Guard.Or(Guard.Nil, Guard.Number)(actor.GetAttribute("NextRunTime")) ?? 0; // the last time we attempted to send a remoteEvent
  const animateEvent = actor.FindFirstChildOfClass("RemoteEvent")! as RemoteEvent<(...args: unknown[]) => void>;
  assert(animateEvent !== undefined);
  // if (tickNo >= nextRunTime + tickOffset) {
  //   // Perform a tween between the longest continuous node A to node B that is one continuous vector
  //   actor.SetAttribute("NextRunTime", tickNo + timeToReach);
  //   animateEvent.FireAllClients(
  //     new CFrame(animationGoalPos).mul(enemyModel.GetPivot().Rotation),
  //     timeToReach * TICK_DELAY,
  //   );
  // } else if (tickNo >= nextRunTime - tickOffset) {
  //   // But before we reach the end perform the old behavior since it is smoother (and less delay between anims)
  //   animateEvent.FireAllClients(new CFrame(newPos).mul(enemyModel.GetPivot().Rotation), TICK_DELAY);
  // }

  animateEvent.FireAllClients(new CFrame(newPos).mul(enemyModel.GetPivot().Rotation), TICK_DELAY);

  actor.SetAttribute("goalNode", goalNode!.pos);
  actor.SetAttribute("Position", newPos);
});
