/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Executes wave function collapse in parallel luau runtime
 *
 * - https://create.roblox.com/docs/scripting/multithreading
 */

import { WaveFunctionCollapse } from "game/modules/WFC";
import Mutex from "shared/modules/sync/Mutex";

script.GetActor()!.BindToMessageParallel("Fire", () => {
  const wfc = new WaveFunctionCollapse({ x: 3, y: 1, z: 3 });
  const p = wfc.collapse();
  // wfc.setupStartAndEnd();
  task.synchronize();
  wfc.show();
});

// class Test {
//   value: number[] = [];
//   flip(wait: number, value: number) {
//     task.defer(() => {
//       for (let i = 0; i < 10; i++) {
//         this.value.push(value);
//       }
//     });
//     print(this.value);
//   }
//   flop(wait: number, value: number) {
//     task.defer(() => {
//       for (let i = 0; i < 10; i++) {
//         this.value.push(value);
//       }
//     });
//     print(this.value);
//   }
// }

// script.GetActor()!.BindToMessageParallel("Fire2", () => {
//   task.desynchronize();
//   const test = new Test();
//   test.flip(5, 1);
//   test.flop(0.5, 2);
//   task.synchronize();
//   print(test.value);
// });

// class TestMutex {
//   value: Mutex<boolean> = new Mutex(false);
//   run() {
//     this.value.lockAndRun((v) => {
//       wait(1);
//       const guard = v.unwrap();
//       guard.write(!guard.read());
//     });
//   }
// }

// script.GetActor()!.BindToMessageParallel("Fire3", () => {
//   const test = new TestMutex();
//   print("running 1");
//   test.run();
//   print("running 2");
//   test.run();
//   test.value.lockAndRun((v) => print(v.unwrap().read()));
// });
