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

const event = script.Parent!.FindFirstChildOfClass("RemoteEvent")! as RemoteEvent<(...args: unknown[]) => void>;
assert(event !== undefined);

const enemyModel = script.Parent!.FindFirstChildOfClass("Model");
assert(enemyModel !== undefined);

let tween: Tween;
let cFrameValue: CFrameValue;

const _connection = event.OnClientEvent.ConnectParallel((maybeCFrame, maybeTime) => {
  task.synchronize();
  tween?.Destroy();
  cFrameValue?.Destroy();
  task.desynchronize();

  const newCFrame = Guard.CFrame(maybeCFrame);
  const time = Guard.Number(maybeTime);

  // https://devforum.roblox.com/t/is-there-any-way-i-can-tween-pivotto/1918057/3
  cFrameValue = new Instance("CFrameValue");
  task.synchronize();
  cFrameValue.Value = enemyModel.GetPivot();

  cFrameValue.GetPropertyChangedSignal("Value").Connect(() => {
    enemyModel.PivotTo(cFrameValue.Value);
  });

  tween = game
    .GetService("TweenService")
    .Create(cFrameValue, new TweenInfo(time, Enum.EasingStyle.Linear, Enum.EasingDirection.In, 0, false, 0), {
      Value: newCFrame,
    });

  tween.Play();
  tween.Completed.Connect(() => {
    cFrameValue.Destroy();
  });
});
