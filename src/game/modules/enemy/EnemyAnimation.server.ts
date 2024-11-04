/**
 * @author Cody Duong <cody.qd@gmail.com
 * @file Handles animation of a specific unit
 *       As of right now it is simply moving from one spot to the next
 *
 * Note that this is done on a client script that is not a localscript (it is RunContext: client).
 *
 * Relies on `EnemyAnimation.meta.json` being present
 *
 * https://devforum.roblox.com/t/live-script-runcontext/1938784
 * https://github.com/rojo-rbx/rojo/issues/791
 */

import Guard from "shared/modules/guard/Guard";
import { TICK_DELAY } from "game/modules/consts";

const actor = script.GetActor()!;
assert(actor !== undefined);
const event = actor.FindFirstChildOfClass("RemoteEvent")! as RemoteEvent<(u: unknown) => void>;
assert(event !== undefined);

const _connection = event.OnClientEvent.Connect((maybeCFrame) => {
  const actor = script.GetActor()!;
  const newCFrame = Guard.CFrame(maybeCFrame);
  const enemyModel = actor.FindFirstChildOfClass("Model");
  assert(enemyModel !== undefined);

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
