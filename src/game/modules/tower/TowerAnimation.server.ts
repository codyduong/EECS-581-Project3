/**
 * @author Cody Duong <cody.qd@gmail.com
 * @file Handles animation of a specific tower
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

const event = script.Parent!.FindFirstChildOfClass("RemoteEvent")! as RemoteEvent<(u: unknown) => void>;
assert(event !== undefined);

let towerModel: Model;
const getTowerModel = (): void => {
  const maybeTowerModel = script.Parent!.FindFirstChildOfClass("Model");
  assert(maybeTowerModel !== undefined);
  towerModel = maybeTowerModel;
  towerModel.Destroying.Once(() => {
    getTowerModel();
  });
};
getTowerModel();

const debugLaser = script.Parent?.FindFirstChild("debugLaser") ?? new Instance("Part");
assert(classIs(debugLaser, "Part"));
debugLaser.Name = "debugLaser";
debugLaser.Parent = script.Parent;
debugLaser.Anchored = true;
debugLaser.CanCollide = false;
debugLaser.CanQuery = false;
debugLaser.CastShadow = false;
debugLaser.Color = new Color3(1, 0, 0);

const _connection = event.OnClientEvent.ConnectParallel((maybeEnemyPos) => {
  const enemyPos = Guard.Vector3(maybeEnemyPos);

  const towerPos = towerModel.GetPivot().Position;
  // set at the same height as enemy, such that we don't pivot in the vertical direction
  const yDiff = enemyPos.Y - towerPos.Y;
  const adjustedPos = new Vector3(towerPos.X, enemyPos.Y, towerPos.Z);

  const newCFrame = CFrame.lookAt(adjustedPos, enemyPos, new Vector3(0, 1, 0)).sub(new Vector3(0, yDiff, 0));

  task.synchronize();

  const distance = adjustedPos.sub(enemyPos).Magnitude;
  debugLaser.Size = new Vector3(0.1, 0.1, distance);
  debugLaser.CFrame = CFrame.lookAt(adjustedPos.Lerp(enemyPos, 0.5), enemyPos, new Vector3(0, 1, 0));

  // https://devforum.roblox.com/t/is-there-any-way-i-can-tween-pivotto/1918057/3
  const cFrameValue = new Instance("CFrameValue");
  cFrameValue.Value = towerModel.GetPivot();
  cFrameValue.GetPropertyChangedSignal("Value").Connect(() => {
    towerModel.PivotTo(cFrameValue.Value);
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
