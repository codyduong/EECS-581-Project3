import { EnemyStats } from "game/modules/enemy/Enemy";

const Enemy4 = {
  health: 10,
  speed: 0.2,
  model: script.WaitForChild("Enemy4") as Model,
  modelOffset: new Vector3(0, 2, 0),
  reward: 5,
} satisfies EnemyStats;

export default Enemy4;
