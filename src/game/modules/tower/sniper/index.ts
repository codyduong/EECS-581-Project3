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

export const Sniper0 = {
  stats: {
    damage: 8,
    ticksBetweenAttacks: 100, // 1 attacks per second, if tick rate is 1/40
    attackType: "raycast",
    range: 25,
    cost: 40,
    upgradesTo: undefined,
  },
  model: script.WaitForChild("Sniper0") as Model,
  sounds: {
    fire: [
      script.WaitForChild("Fire0") as Sound,
      script.WaitForChild("Fire1") as Sound,
      script.WaitForChild("Fire2") as Sound,
    ],
    reload: [script.WaitForChild("Reload0") as Sound, script.WaitForChild("Reload1") as Sound],
  },
} satisfies TowerMeta;
