/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Executes wave function collapse in parallel luau runtime
 *
 * - https://create.roblox.com/docs/scripting/multithreading
 */

import { WaveFunctionCollapse } from "game/modules/WFC";

script.GetActor()!.BindToMessageParallel("Fire", () => {
  const wfc = new WaveFunctionCollapse({ x: 25, y: 1, z: 25 });
  const p = wfc.collapse();
  task.synchronize();
  wfc.show();
});
