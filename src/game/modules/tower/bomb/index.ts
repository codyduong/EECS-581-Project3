/**
 * @prologue
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Noob models and stats
 * @precondition N/A
 * @postcondition N/A
 * @invariant Assumes that the necessary `*.rbxmx` files exist.
 * @throws Errors if the files don't exist
 * [2024.December.4]{@revision Create bomb stats}
 */

import { TowerMeta } from "game/modules/tower/Tower";

export const Bomb0 = {
  stats: {
    damage: 5,
    ticksBetweenAttacks: 100, // 0.4 attacks per second, if tick rate is 1/40
    attackType: "bomb",
    bombRange: 2.5,
    bombSpeed: 0.15,
    range: 10,
    cost: 50,
    upgradesTo: "Bomb1",
  },
  model: script.WaitForChild("Noob0") as Model,
  sounds: {
    explode: [
      script.WaitForChild("BombExplode0") as Sound,
      script.WaitForChild("BombExplode1") as Sound,
      script.WaitForChild("BombExplode2") as Sound,
    ],
    fire: [script.WaitForChild("Fire0") as Sound],
  },
} satisfies TowerMeta;
export const Bomb1 = {
  stats: {
    damage: 10,
    ticksBetweenAttacks: 80, // 0.4 attacks per second, if tick rate is 1/40
    attackType: "bomb",
    bombRange: 4,
    bombSpeed: 0.15,
    range: 15,
    cost: 100,
    upgradesTo: undefined,
  },
  model: script.WaitForChild("Noob0") as Model,
  sounds: {
    explode: [
      script.WaitForChild("BombExplode0") as Sound,
      script.WaitForChild("BombExplode1") as Sound,
      script.WaitForChild("BombExplode2") as Sound,
    ],
    fire: [script.WaitForChild("Fire0") as Sound],
  },
} satisfies TowerMeta;
