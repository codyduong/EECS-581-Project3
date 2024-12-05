import { TICK_DELAY } from "game/modules/consts";
import { EnemyType } from "game/modules/enemy/Enemy";
import EnemySupervisor from "game/modules/EnemySupervisor";
import Guard from "shared/modules/guard/Guard";

type wave = {
  ticksTilReady: number;
  fns: ((enemySupervisor: EnemySupervisor) => thread[])[];
  reward: number;
};

const createEnemyAtInterval = (
  enemySupervisor: EnemySupervisor,
  enemy: EnemyType,
  quantity: number,
  interval: number,
  offset: number = 0,
): thread[] => {
  Guard.NumberMin(0)(quantity);
  const res: thread[] = [];
  for (let i = 0; i < quantity; i++) {
    res.push(
      task.delay(offset + TICK_DELAY * interval * i, () => {
        const [success] = pcall(() => enemySupervisor.createEnemy(enemy));
        if (!success) {
          error("Enemy failed to generate");
        }
      }),
    );
  }
  return res;
};

const WAVES: wave[] = [
  {
    ticksTilReady: 300,
    fns: [(e) => createEnemyAtInterval(e, "BasicEnemy", 10, 30)],
    reward: 20,
  },
  {
    ticksTilReady: 600,
    fns: [(e) => createEnemyAtInterval(e, "BasicEnemy", 20, 30)],
    reward: 40,
  },
  {
    ticksTilReady: 400,
    fns: [
      (e) => createEnemyAtInterval(e, "BasicEnemy", 10, 10, 0),
      (e) => createEnemyAtInterval(e, "Enemy2", 10, 20, 200),
    ],
    reward: 80,
  },
  {
    ticksTilReady: 400,
    fns: [(e) => createEnemyAtInterval(e, "Enemy2", 20, 20, 0)],
    reward: 120,
  },
  {
    ticksTilReady: 400,
    fns: [
      (e) => createEnemyAtInterval(e, "BasicEnemy", 10, 20, 0),
      (e) => createEnemyAtInterval(e, "Enemy2", 10, 10, 5),
      (e) => createEnemyAtInterval(e, "Enemy3", 3, 15, 100),
    ],
    reward: 140,
  },
  {
    ticksTilReady: 300,
    fns: [(e) => createEnemyAtInterval(e, "Enemy3", 20, 15, 0)],
    reward: 240,
  },
  {
    ticksTilReady: 300,
    fns: [(e) => createEnemyAtInterval(e, "Enemy3", 20, 15, 0), (e) => createEnemyAtInterval(e, "Enemy4", 5, 20, 200)],
    reward: 240,
  },
];

export default function createWave(
  waveNumber: number,
  enemySupervisor: EnemySupervisor,
  threads: thread[],
  makeReadyForNextWave: (waveReward: number) => void,
): boolean {
  Guard.NumberMin(1)(waveNumber);
  const [hasWave, wave] = Guard.Check(Guard.NonNil<wave>)(WAVES[waveNumber - 1]);

  if (!hasWave) {
    return false;
  }

  wave.fns.forEach((f) => f(enemySupervisor).forEach((t) => threads.push(t)));
  threads.push(task.delay(TICK_DELAY * wave.ticksTilReady, () => makeReadyForNextWave(wave.reward)));

  return true;
}
