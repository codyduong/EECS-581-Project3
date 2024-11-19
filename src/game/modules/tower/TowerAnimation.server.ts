/**
 * @prologue
 *
 * @author Cody Duong
 *
 * @file Handles animation of a specific tower. This file is meta-exported in `./index.ts` which is then used in
 *       [TowerSupervisor]{@link TowerSupervisor}.
 *
 * @precondition Expects the following to be true:
 *               1. A sibling of {@link RemoteEvent} exists
 *               2. A sibling of {@link Model} exists
 *               3. Is cloned, enabled, then run. This is done by `TowerSupervisor.ts`. This precondition is guarded by
 *                  `TowerAnimation.meta.json` containing the key value pair `"Disabled": true` (and not explictly)
 *                  within this code.
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
 */

import Guard from "shared/modules/guard/Guard";
import { TICK_DELAY } from "game/modules/consts";

// 1st precondition
const event = script.Parent!.FindFirstChildOfClass("RemoteEvent")! as RemoteEvent<(u: unknown) => void>;
assert(event !== undefined); // Assert it exists, otherwise error

let towerModel: Model;
/**
 * Helper function which gets the {@link Model} sibling residing next to this animation script.
 *
 * @precondition A sibling of {@link Model} exists
 * @sideeffect Updates {@link towerModel} which is used in {@link _connection}
 * @throws Errors if there is no sibling {@link Model}
 */
const getTowerModel = (): void => {
  const maybeTowerModel = script.Parent!.FindFirstChildOfClass("Model");
  assert(maybeTowerModel !== undefined);
  towerModel = maybeTowerModel;
  /**
   * Sometimes we change the model, so if the previous model is destroyed, then attempt to find the new model.
   * (IE. when we upgrade, we change the model)
   *
   * If we failed, then we destroyed the entire Tower? If we destroyed this Tower, then we likely destroyed this script
   * so it should not execute, but depending on [Heartbeat]{@link https://create.roblox.com/docs/reference/engine/classes/RunService#Heartbeat}
   * it is possible that this is still run despite being destroyed... This is pretty infrequent, and since the error
   * comes from something that is being destroyed anyways, it is immaterial in its consequence.
   *
   * @todo Maybe just catch this error safely and redirect output to normal {@link print}? -codyduong 2024, Nov 11
   */
  towerModel.Destroying.Once(() => {
    getTowerModel();
  });
};
// 2nd precondition
getTowerModel();

/**
 * @todo Remove {@link debugLaser}. It is simply a vizualization of the attack. This should go hand-in-hand with
 * adding unique tower animations.
 */
const debugLaser = script.Parent?.FindFirstChild("debugLaser") ?? new Instance("Part");
assert(classIs(debugLaser, "Part"));
debugLaser.Name = "debugLaser";
debugLaser.Parent = script.Parent;
debugLaser.Anchored = true;
debugLaser.CanCollide = false;
debugLaser.CanQuery = false;
debugLaser.CastShadow = false;
debugLaser.Color = new Color3(1, 0, 0);

/**
 * The core animation function. Is triggered whenever the `TowerAI` requests an animation to be played. Right now it
 * simply points the tower at the enemy
 *
 * @note Runs on [Parallel Lua]{@link https://create.roblox.com/docs/scripting/multithreading} for speed.
 * @sideeffect As long as {@link event} exists will run whenever queried for an animation. Automatically cleaned up.
 *             Animation has a side-effect on the client which is always retained. No action on server.
 */
const _connection = event.OnClientEvent.ConnectParallel(
  /**
   * @param maybeEnemyPos Maybe a {@link Vector3}
   * @throws Errors if {@link maybeEnemyPos} is not a {@link Vector3}
   */
  (maybeEnemyPos) => {
    const enemyPos = Guard.Vector3(maybeEnemyPos);

    const towerPos = towerModel.GetPivot().Position;
    // set at the same height as enemy, such that we don't pivot in the vertical direction
    const yDiff = enemyPos.Y - towerPos.Y;
    const adjustedPos = new Vector3(towerPos.X, enemyPos.Y, towerPos.Z);

    const newCFrame = CFrame.lookAt(adjustedPos, enemyPos, new Vector3(0, 1, 0)).sub(new Vector3(0, yDiff, 0));

    // switch to sync runtime
    task.synchronize();

    // get the distance between the tower and enemy
    const distance = adjustedPos.sub(enemyPos).Magnitude;
    debugLaser.Size = new Vector3(0.1, 0.1, distance);
    debugLaser.CFrame = CFrame.lookAt(adjustedPos.Lerp(enemyPos, 0.5), enemyPos, new Vector3(0, 1, 0));

    // https://devforum.roblox.com/t/is-there-any-way-i-can-tween-pivotto/1918057/3
    const cFrameValue = new Instance("CFrameValue");
    cFrameValue.Value = towerModel.GetPivot();
    cFrameValue.GetPropertyChangedSignal("Value").Connect(() => {
      towerModel.PivotTo(cFrameValue.Value);
    });

    // setup animating pointing the tower at the enemy
    const tween = game
      .GetService("TweenService")
      .Create(cFrameValue, new TweenInfo(TICK_DELAY, Enum.EasingStyle.Linear, Enum.EasingDirection.Out, 0, false, 0), {
        Value: newCFrame,
      });

    // play the animation
    tween.Play();

    // setup garbage collection for the animation
    tween.Completed.Connect(() => {
      cFrameValue.Destroy();
    });
  },
);
