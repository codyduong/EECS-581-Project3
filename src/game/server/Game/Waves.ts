import { TICK_DELAY } from "game/modules/consts";
import { EnemyType } from "game/modules/enemy/Enemy";
import EnemySupervisor from "game/server/EnemySupervisor";
import Guard from "shared/modules/guard/Guard";

type wave = {
  args: [
    enemy: EnemyType,
    quantity: number,
    interval: number, // in ticks
    offset?: number,
  ][];
  reward: number;
};

const createEnemyAtInterval = (
  wave: number,
  enemySupervisor: EnemySupervisor,
  enemy: EnemyType,
  quantity: number,
  interval: number, // in ticks
  offset: number = 0, // in ticks
): thread[] => {
  Guard.NumberMin(0)(quantity);
  const res: thread[] = [];
  enemySupervisor.registerEnemies(wave, quantity);
  for (let i = 0; i < quantity; i++) {
    res.push(
      task.delay(TICK_DELAY * offset + TICK_DELAY * interval * i, () => {
        const [success, msg] = pcall(() => enemySupervisor.createEnemy(enemy, wave));
        if (!success) {
          error(`Enemy failed to generate: ${msg}`);
        }
      }),
    );
  }
  return res;
};

const WAVES: wave[] = [
  {
    args: [["BasicEnemy", 10, 30]],
    reward: 20,
  },
  {
    args: [["BasicEnemy", 20, 30]],
    reward: 40,
  },
  {
    args: [
      ["BasicEnemy", 10, 10, 0],
      ["Enemy2", 10, 20, 200],
    ],
    reward: 80,
  },
  {
    args: [["Enemy2", 20, 20, 0]],
    reward: 120,
  },
  {
    args: [
      ["BasicEnemy", 10, 20, 0],
      ["Enemy2", 10, 10, 5],
      ["Enemy3", 3, 15, 100],
    ],
    reward: 140,
  },
  {
    args: [["Enemy3", 20, 15, 0]],
    reward: 240,
  },
  {
    args: [
      ["Enemy3", 20, 15, 0],
      ["Enemy4", 5, 20, 200],
    ],
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

  wave.args.forEach((args) => {
    createEnemyAtInterval(waveNumber, enemySupervisor, ...args).forEach((t) => threads.push(t));
  });
  enemySupervisor.registerConnection(waveNumber).Changed.Once(() => {
    print("wave done gen");
    makeReadyForNextWave(wave.reward);
  });

  return true;
}
