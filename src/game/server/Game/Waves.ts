import { TICK_DELAY } from "game/modules/consts";
import { EnemyType } from "game/modules/enemy/Enemy";
import EnemySupervisor from "game/modules/EnemySupervisor";
import Guard from "shared/modules/guard/Guard";

type wave = {
  ticksTilReady: number;
  fns: ((enemySupervisor: EnemySupervisor) => thread[])[];
};

const createEnemyAtInterval = (
  enemySupervisor: EnemySupervisor,
  enemy: EnemyType,
  quantity: number,
  interval: number,
): thread[] => {
  Guard.NumberMin(0)(quantity);
  const res: thread[] = [];
  for (let i = 0; i < quantity; i++) {
    res.push(
      task.delay(TICK_DELAY * interval * i, () => {
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
    ticksTilReady: 400,
    fns: [(e) => createEnemyAtInterval(e, "BasicEnemy", 10, 30)],
  },
  {
    ticksTilReady: 400,
    fns: [(e) => createEnemyAtInterval(e, "BasicEnemy", 20, 20)],
  },
];

export default function createWave(
  waveNumber: number,
  enemySupervisor: EnemySupervisor,
  threads: thread[],
  makeReadyForNextWave: () => void,
): boolean {
  Guard.NumberMin(1)(waveNumber);
  const [hasWave, wave] = Guard.Check(Guard.NonNil<wave>)(WAVES[waveNumber - 1]);

  if (!hasWave) {
    return false;
  }

  wave.fns.forEach((f) => f(enemySupervisor).forEach((t) => threads.push(t)));
  threads.push(task.delay(TICK_DELAY * wave.ticksTilReady, () => makeReadyForNextWave()));

  return true;
}
