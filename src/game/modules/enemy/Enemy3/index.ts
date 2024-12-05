import { EnemyStats } from "game/modules/enemy/Enemy";

const Enemy3 = {
  health: 3,
  speed: 0.25,
  model: script.WaitForChild("Enemy3") as Model,
  modelOffset: new Vector3(0, 2, 0),
  reward: 3,
} satisfies EnemyStats;

export default Enemy3;
