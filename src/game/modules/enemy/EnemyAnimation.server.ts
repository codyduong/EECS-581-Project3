/**
 * @prologue
 *
 * @author Cody Duong
 *
 * @file Handles animation of a specific tower. This file is meta-exported in `./index.ts` which is then used in
 *       [EnemySupervisor]{@link EnemySupervisor}.
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
 * [2024.November.4]{@revision Initial creation to support enemy animations}
 * [2024.November.24]{@revision Improve prologue and inline comments (no logical changes)}
 */

import Guard from "shared/modules/guard/Guard";
import { TICK_DELAY } from "game/modules/consts";

const event = script.Parent!.FindFirstChildOfClass("RemoteEvent")! as RemoteEvent<(u: unknown) => void>;
assert(event !== undefined);

const enemyModel = script.Parent!.FindFirstChildOfClass("Model");
assert(enemyModel !== undefined);

const _connection = event.OnClientEvent.Connect((maybeCFrame) => {
  const newCFrame = Guard.CFrame(maybeCFrame);

  // https://devforum.roblox.com/t/is-there-any-way-i-can-tween-pivotto/1918057/3
  const cFrameValue = new Instance("CFrameValue");
  cFrameValue.Value = enemyModel.GetPivot();

  cFrameValue.GetPropertyChangedSignal("Value").Connect(() => {
    enemyModel.PivotTo(cFrameValue.Value);
  });

  const tween = game
    .GetService("TweenService")
    .Create(cFrameValue, new TweenInfo(TICK_DELAY, Enum.EasingStyle.Linear, Enum.EasingDirection.Out, 0, false, 0), {
      Value: newCFrame,
    });

  tween.Play();
  tween.Completed.Connect(() => {
    cFrameValue.Destroy();
  });
});
