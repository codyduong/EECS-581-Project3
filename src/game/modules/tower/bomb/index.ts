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
    damage: 1,
    ticksBetweenAttacks: 40, // 1 attacks per second, if tick rate is 1/40
    attackType: "bomb",
    range: 10,
    cost: 1,
    upgradesTo: undefined,
  },
  model: script.WaitForChild("Noob0") as Model,
} satisfies TowerMeta;
