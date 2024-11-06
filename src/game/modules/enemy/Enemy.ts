import BasicEnemy from "./BasicEnemy";

export type EnemyStats = {
  health: number;
  speed: number; // studs per tick
  model: Model;
  modelOffset: Vector3;
};

export const Enemies = {
  BasicEnemy: BasicEnemy,
} as const;

type EnemyTypes = keyof typeof Enemies;

interface EnemyProps {
  guid?: string;
  type: EnemyTypes;
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
  }
}
