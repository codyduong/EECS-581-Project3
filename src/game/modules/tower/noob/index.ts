/**
 * @prologue
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Noob models and stats
 * @precondition N/A
 * @postcondition N/A
 * @invariant Assumes that the necessary `*.rbxmx` files exist.
 * @throws Errors if the files don't exist
 * @revisions
 * [2024.October.27]{@revision Initial stub placeholder for `*.rbxmx` exports}
 * [2024.November.11]{@revision Add `Noob` export (now Noob0)}
 * [2024.November.18]{@revision `Noob` -> `Noob0` and adds `Noob1.rbxmx`}
 */

import { TowerMeta } from "game/modules/tower/Tower";

export const Noob0 = {
  stats: {
    damage: 1,
    ticksBetweenAttacks: 40, // 1 attacks per second, if tick rate is 1/40
    attackType: "raycast",
    range: 10,
    cost: 1,
    upgradesTo: "Noob1",
  },
  model: script.WaitForChild("Noob0") as Model,
} satisfies TowerMeta;
export const Noob1 = {
  stats: {
    damage: 1,
    ticksBetweenAttacks: 20, // 2 attacks per second, if tick rate is 1/40
    attackType: "raycast",
    range: 10,
    cost: 2,
    upgradesTo: undefined,
  },
  model: script.WaitForChild("Noob1") as Model,
} satisfies TowerMeta;
