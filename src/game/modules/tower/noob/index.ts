/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Noob models and stats
 */

import { TowerStats } from "game/modules/tower/Tower";

export const Noob0Model = script.WaitForChild("Noob0") as Model;
export const Noob1Model = script.WaitForChild("Noob1") as Model;
export const NoobStats = {
  damage: 1,
  ticksBetweenAttacks: 40, // 1 attacks per second, if tick rate is 1/40
  attackType: "raycast",
  range: 10,
} satisfies TowerStats;
