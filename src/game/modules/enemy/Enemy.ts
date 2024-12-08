import BasicEnemy from "./BasicEnemy";
import Enemy2 from "./Enemy2";
import Enemy3 from "./Enemy3";
import Enemy4 from "./Enemy4";

export type EnemyStats = {
  health: number;
  speed: number; // studs per tick
  model: Model;
  modelOffset: Vector3;
  reward: number; // coins given upon death
};

export const Enemies = {
  BasicEnemy: BasicEnemy,
  Enemy2: Enemy2,
  Enemy3: Enemy3,
  Enemy4: Enemy4,
} as const;

export type EnemyType = keyof typeof Enemies;

interface EnemyProps {
  guid?: string;
  type: EnemyType;
  parent: Instance;
  position: Vector3;
}

export default class Enemy {
  readonly guid: string;
  readonly type: string;
  readonly health: number;
  readonly speed: number;
  readonly model: Model;
  readonly modelOffset: Vector3;
  readonly reward: number;

  constructor(props: EnemyProps) {
    this.guid = props.guid ?? game.GetService("HttpService").GenerateGUID();
    this.type = props.type;
    const enemyStats = Enemies[props.type];
    assert(enemyStats !== undefined, `Invalid enemy type: ${props.type}`);
    this.modelOffset = enemyStats.modelOffset;
    this.health = enemyStats.health;
    this.speed = enemyStats.speed;
    const model = enemyStats.model.Clone();
    model.Parent = props.parent;
    model.PivotTo(new CFrame(props.position).add(this.modelOffset).mul(model.GetPivot().Rotation));
    this.model = model;
    this.reward = enemyStats.reward;
  }
}
