/**
 * @author Cody Duong
 * @file This is a singleton class which should manage the enemy AI. It helps delegate multithreaded control of each
 *       enemy into one file.
 */

import { EnemyAI, EnemyAnimation } from "game/server/enemy";
import Enemy, { EnemyType } from "game/modules/enemy/Enemy";
import { Node, Vector3Key } from "game/modules/Path";

export let path: Map<Vector3Key, Node>; // idk if this is a good idea... this should only be used by enemy

let singletonExisting = false;

interface EnemySupervisorProps {
  starts: Node[];
  path: Map<Vector3Key, Node>;
}

export default class EnemySupervisor {
  private chosenStart: number = 0; // goes from 0 to size of starts, used for alternating spawns
  private starts: Node[];
  private path: Map<Vector3Key, Node>;
  private enemyFolder: Folder;
  private enemies: Actor[] = [];
  private destroyed = false;

  private enemyNumber = 0;

  constructor(props: EnemySupervisorProps) {
    assert(
      singletonExisting === false,
      "EnemySupervisor singleton already exists. Did we call `Destroy()` on the old EnemySupervisor?",
    );
    singletonExisting = true;
    this.starts = props.starts;
    this.path = props.path;
    path = this.path;
    let maybeFolder = game.Workspace.FindFirstChild("EnemyFolder");
    if (!maybeFolder) {
      maybeFolder = new Instance("Folder");
      maybeFolder.Name = "EnemyFolder";
      maybeFolder.Parent = game.Workspace;
    }
    assert(classIs(maybeFolder, "Folder"));
    this.enemyFolder = maybeFolder;
  }

  /**
   * Create an enemy of a type
   *
   * @todo: add enemy types
   *
   * @todo: should this be here, or should the Enemy constructor create all of this?
   */
  public createEnemy(t: EnemyType): void {
    this.AssertNotDestroyed();

    // create the enemy actor
    const enemyActor = new Instance("Actor"); // used for parallel computation
    enemyActor.Parent = this.enemyFolder;
    enemyActor.Name = `${this.enemyNumber}`;

    // add the enemy ai to the actor
    const enemyAi = EnemyAI.Clone();
    enemyAi.Parent = enemyActor;
    require(enemyAi); // we need to load the moduleScript to bind to the actor

    const enemyAnimation = EnemyAnimation.Clone();
    enemyAnimation.Parent = enemyActor;
    enemyAnimation.Enabled = true;

    const enemyAnimationEvent = new Instance("RemoteEvent"); // TODO should this be here or in a *.json for rojo?
    enemyAnimationEvent.Parent = enemyActor;

    this.chosenStart = (this.chosenStart + 1) % this.starts.size();
    const node = this.starts[this.chosenStart];
    const goalNode = this.path.get(node.next[0])?.pos;
    assert(goalNode !== undefined);
    // TODO this enemy should not even be parented to the datamodel on the server. Instead use some replication magic...
    // IDK.
    const enemy = new Enemy({ type: t, parent: enemyActor, position: node.pos });

    // add some data about the enemy to the actor to access
    enemyActor.SetAttribute("health", enemy.health);
    enemyActor.SetAttribute("goalNode", goalNode); // todo support branching starts? or maybe never make those
    enemyActor.SetAttribute("speed", enemy.speed); // studs per tick
    enemyActor.SetAttribute("modelOffset", enemy.modelOffset);
    enemyActor.SetAttribute("Position", enemy.model.GetPivot().Position);
    enemyActor.SetAttribute("distanceTravelled", 0);
    enemyActor.SetAttribute("pendingDmg", 0);
    enemyActor.SetAttribute("reward", enemy.reward);

    this.enemies.push(enemyActor);

    // naive way to unique id enemies, maybe use guid? this is guranteed uniqueness unlike guid
    // (guid collision statisically is unlikely... todo implement uuid? or take from a roblox library with uuid)
    // and doesn't overflow until 9.2 quintillion
    // https://stackoverflow.com/questions/78588093/getting-over-the-roblox-leaderstats-intvalue-limit
    this.enemyNumber += 1;
  }

  /**
   * Fires an event to every single enemy actor (ie. makes every enemy think)
   */
  public tick(): void {
    this.AssertNotDestroyed();

    // TODO? i wonder if we should start computations from front to end to end to front? does it make an appreciable
    // difference? who knows... multithreading makes the game non-determinstic...

    // this task defer means ticks are non-determinstically a different time apart... uhhh i don't know
    // the best analogy is like minecraft ticks are usually 20 per second, but depending on server load this can
    // decrease.
    task.defer(() => {
      // enemy actor will get destroyed when they reach the end or die, assuming it will always be in DataModel when alive
      // and otherwise `Destroy()` was called on the actor
      this.enemies = this.enemies.filter((enemy) => enemy.Parent !== undefined);

      this.enemies.forEach((enemy) => {
        enemy?.SendMessage("tick");
      });
    });
  }

  /**
   * @throws if {@link Destroy|`Destroy`} was already called
   */
  private AssertNotDestroyed(): void {
    assert(this.destroyed !== true, "This EnemySupervisor had Destroy() called. No further operations permitted");
  }

  public Destroy(): void {
    this.AssertNotDestroyed();
    this.destroyed = true;
    singletonExisting = false;
    this.enemies.forEach((enemy) => {
      enemy.Destroy();
    });
  }
}
