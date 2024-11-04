/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Executes wave function collapse in parallel luau runtime
 *
 * - https://create.roblox.com/docs/scripting/multithreading
 */

import EnemySupervisor from "game/modules/EnemySupervisor";
import { PathGenerator } from "game/modules/Path";
import { WaveFunctionCollapse } from "game/modules/WFC";

// 1459599628, guranteed contradiction { x: 12, y: 1, z: 12, pathLength: 24, horizontalPadding: 2, seed: 1459599628 }

const wfc = new WaveFunctionCollapse({ x: 12, y: 1, z: 12, pathLength: 24, horizontalPadding: 2 });

export const WaveFunctionCollapseActor = script.GetActor()!;

let enemySupervisor: EnemySupervisor;
let threads: thread[] = [];

/** todo encapsulate in better game logic that runs at start */
function generate(): void {
  let [result, msg] = [false, ""];
  while (result === false) {
    if (msg !== "") {
      print("Failed to generate because: ");
      print(msg);
      print("retrying...");
    }
    [result, msg] = pcall(() => {
      print("actually generating");
      wfc.resetGrid();
      wfc.collapse();
    }) as LuaTuple<[boolean, string]>;
  }
  task.synchronize();
  const grid = wfc.show();
  // print(game.GetService("HttpService").JSONEncode(grid));
  const [starts, path] = PathGenerator.fromGrid(grid);
  // let colorIndex = 0;
  // let stack = [startNode];
  // while (stack.size() > 0) {
  //   let nodes = stack.pop();
  //   if (nodes === undefined) {
  //     break;
  //   }
  //   for (const node of nodes) {
  //     assert(node !== undefined);
  //     const p = new Instance("Part");
  //     p.Color = rainbowColors[colorIndex];
  //     colorIndex = (colorIndex + 1) % rainbowColors.size();
  //     // print(p.Color);
  //     p.Anchored = true;
  //     p.Parent = game.Workspace;
  //     p.Position = node.pos;
  //     stack.push(
  //       node.next.map((nextNode) => {
  //         const n = path.get(nextNode);
  //         assert(n !== undefined);
  //         return n;
  //       }),
  //     );
  //   }
  // }
  print(starts, path);

  enemySupervisor?.Destroy();
  threads.forEach((thread) => task.cancel(thread));
  enemySupervisor = new EnemySupervisor({ starts, path });

  threads.push(
    task.spawn(() => {
      while (true) {
        const [success] = pcall(() => enemySupervisor.createEnemy());
        if (!success) {
          error("Enemy failed to generate");
        }
        task.wait(0.1);
      }
    }),
    // 0.05 seconds results in 20 ticks per second
    task.spawn(() => {
      while (true) {
        const [success] = pcall(() => enemySupervisor.tick());
        if (!success) {
          error("AI failed to run");
        }
        task.wait(0.05);
      }
    }),
  );
}

WaveFunctionCollapseActor!.BindToMessageParallel("RegenerateMap", () => {
  generate();
});
