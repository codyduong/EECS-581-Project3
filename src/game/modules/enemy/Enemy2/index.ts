import { EnemyStats } from "game/modules/enemy/Enemy";

const Enemy2 = {
  health: 4,
  speed: 0.1,
  model: script.WaitForChild("Enemy2") as Model,
  modelOffset: new Vector3(0, 2, 0),
  reward: 2,
} satisfies EnemyStats;

export default Enemy2;
