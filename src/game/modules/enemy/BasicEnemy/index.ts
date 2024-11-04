import { EnemyStats } from "game/modules/enemy/Enemy";

const BasicEnemy = {
  health: 100,
  speed: 0.1,
  model: script.WaitForChild("BasicEnemy") as Model,
  modelOffset: new Vector3(0, 2, 0),
} satisfies EnemyStats;

export default BasicEnemy;
