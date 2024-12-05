import { EnemyStats } from "game/modules/enemy/Enemy";

const BasicEnemy = {
  health: 2,
  speed: 0.05,
  model: script.WaitForChild("BasicEnemy") as Model,
  modelOffset: new Vector3(0, 2, 0),
  reward: 1,
} satisfies EnemyStats;

export default BasicEnemy;
