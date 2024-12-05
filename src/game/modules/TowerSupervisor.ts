/**
 * @author Cody Duong
 *
 * @file This is a singleton class which should manage the tower AI. It helps delegate multithreaded control of each
 *       tower into one file.
 *
 * @todo like towerSupervisor this maybe should only be serverside? w/e
 */

import { assertServer } from "shared/modules/utils";
import { Tower, TowerStats } from "./tower/Tower";
import { TowerAI, TowerAnimation } from "./tower";
import Guard from "shared/modules/guard/Guard";
import { TICKS_PER_SECOND } from "./consts";

const updateStats = (actor: Actor, stats: TowerStats): void => {
  actor.SetAttribute("damage", stats.damage);
  actor.SetAttribute("ticksBetweenAttacks", stats.ticksBetweenAttacks);
  actor.SetAttribute("attackType", stats.attackType);
  actor.SetAttribute("range", stats.range);
};

let singletonExisting = false;

export default class TowerSupervisor {
  private towers: Actor[] = [];
  private towerFolder: Folder;
  private destroyed = false;

  constructor() {
    assertServer();
    assert(
      singletonExisting === false,
      "TowerSupervisor singleton already exists. Did we call `Destroy()` on the old TowerSupervisor?",
    );
    singletonExisting = true;
    let maybeFolder = game.Workspace.FindFirstChild("towerFolder");
    if (!maybeFolder) {
      maybeFolder = new Instance("Folder");
      maybeFolder.Name = "TowerFolder";
      maybeFolder.Parent = game.Workspace;
    }
    assert(classIs(maybeFolder, "Folder"));
    this.towerFolder = maybeFolder;
  }

  /**
   * This is a bit confusing, but basically only the server needs to create TowerAi, while Towers are created both
   * by the server and clients.
   */
  public addTowerAi(tower: Tower): void {
    this.AssertNotDestroyed();

    print(`Adding tower AI ${tower.guid}`);

    // create the tower actor
    const towerActor = new Instance("Actor"); // used for parallel computation
    towerActor.Parent = this.towerFolder;
    towerActor.Name = tower.guid;

    // add the tower ai to the actor
    const towerAi = TowerAI.Clone();
    towerAi.Parent = towerActor;
    require(towerAi); // we need to load the moduleScript to run it

    // add the tower animation to the actor
    const towerAnimation = TowerAnimation.Clone();
    towerAnimation.Parent = towerActor;
    towerAnimation.Enabled = true; // the act of enabling a script is enough to run it

    const towerAnimationEvent = new Instance("RemoteEvent"); // TODO should this be here or in a *.json for rojo?
    towerAnimationEvent.Parent = towerActor;

    const stats = Tower.getTypeStats(tower.type);

    // add some data about the tower to the actor to access
    towerActor.SetAttribute("guid", tower.guid);
    towerActor.SetAttribute("Position", tower.model.GetPivot().Position);
    towerActor.SetAttribute("lastAttacked", -TICKS_PER_SECOND - 1); // the tick we last attacked, uses -TICK_DELAY since we can and want to be able to attack at tick 0
    if (stats.attackType === "bomb") {
      towerActor.SetAttribute("bombRange", stats.bombRange);
      towerActor.SetAttribute("bombSpeed", stats.bombSpeed);
    }
    updateStats(towerActor, stats);

    this.towers.push(towerActor);
  }

  public removeTowerAi(tower: Tower): void {
    this.AssertNotDestroyed();

    print(`Removing tower AI ${tower.guid}`);

    this.towers = this.towers.filter((t) => {
      print(t.GetAttributes());
      const tGuid = Guard.String(t.GetAttribute("guid"));
      if (tGuid === tower.guid) {
        t.Destroy();
        return false;
      }
      return true;
    });
  }

  public updateTowerAi(tower: Tower): void {
    this.AssertNotDestroyed();

    print(`Updating tower AI ${tower.guid}`);

    const towerActor = Guard.NonNil(
      this.towers.find((t) => {
        const tGuid = Guard.String(t.GetAttribute("guid"));
        if (tGuid === tower.guid) {
          return true;
        }
        return false;
      }),
    );

    const stats = Tower.getTypeStats(tower.type);
    updateStats(towerActor, stats);
  }

  /**
   * Fires an event to every single tower actor (ie. makes every tower think)
   */
  public tick(tick: number): void {
    this.AssertNotDestroyed();

    // TODO? i wonder if we should start computations from front to end to end to front? does it make an appreciable
    // difference? who knows... multithreading makes the game non-determinstic...

    // this task defer means ticks are non-determinstically a different time apart... uhhh i don't know
    // the best analogy is like minecraft ticks are usually 20 per second, but depending on server load this can
    // decrease.
    task.defer(() => {
      this.towers.forEach((tower) => {
        tower.GetActor()?.SendMessage("tick", tick);
      });
    });
  }

  /**
   * @throws if {@link Destroy|`Destroy`} was already called
   */
  private AssertNotDestroyed(): void {
    assert(this.destroyed !== true, "This TowerSupervisor had Destroy() called. No further operations permitted");
  }

  Destroy(): void {
    this.AssertNotDestroyed();
    this.destroyed = true;
    this.towers.forEach((tower) => tower.Destroy());
    singletonExisting = false;
  }
}
