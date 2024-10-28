/**
 * @author Cody Duong
 * @file This is a singleton class which should manage the enemy AI. It helps delegate multithreaded control of each
 *       enemy into one file.
 */

import Enemy from "./enemy";
import { Node, Vector3Key } from "./Path";

export let path: Map<Vector3Key, Node>; // idk if this is a good idea... this should only be used by enemy

interface EnemySupervisorProps {
  starts: Node[];
  path: Map<Vector3Key, Node>;
}

export default class EnemySupervisor {
  private chosenStart: number = 0; // goes from 0 to size of starts, used for alternating spawns
  private starts: Node[];
  private path: Map<Vector3Key, Node>;
  private enemyFolder: Folder;
  private enemies: Array<ModuleScript> = [];

  private enemyNumber = 0;

  constructor(props: EnemySupervisorProps) {
    this.starts = props.starts;
    this.path = props.path;
    path = this.path;
    this.enemyFolder = new Instance("Folder");
    this.enemyFolder.Name = "EnemyFolder";
    this.enemyFolder.Parent = game.Workspace;
    game.Workspace.WaitForChild(this.enemyFolder.Name); // yield for the creation (always returns near instantly)
  }

  /**
   * Create an enemy of a type
   *
   * TODO: add enemy types
   */
  public createEnemy() {
    // create the enemy actor
    const enemyActor = new Instance("Actor"); // used for parallel computation
    enemyActor.Parent = this.enemyFolder;
    enemyActor.Name = `${this.enemyNumber}`;

    // add the enemy ai to the actor
    const enemyAi = Enemy.Clone();
    enemyAi.Parent = enemyActor;
    require(enemyAi); // we need to load the moduleScript to bind to the actor

    // add the enemy model
    // TODO this should not be hardcoded
    const enemy = new Instance("Part");
    enemy.Parent = enemyActor;
    enemy.Anchored = true;
    enemy.Size = new Vector3(0.5, 0.5, 0.5);

    // print(this.starts);
    this.chosenStart = (this.chosenStart + 1) % this.starts.size();
    const node = this.starts[this.chosenStart];
    const modelOffset = new Vector3(0, 2, 0);
    enemy.Position = node.pos.add(modelOffset); // spawn 2 studs above node (floating)
    this.enemies.push(enemyAi);
    const goalNode = this.path.get(node.next[0])?.pos;
    assert(goalNode !== undefined);

    // add some data about the enemy to the actor to access
    enemyActor.SetAttribute("health", 100);
    // enemyActor.SetAttribute("position", enemy.Position); // todo audit usage? is this a useful attribute
    enemyActor.SetAttribute("goalNode", goalNode); // todo support branching starts? or maybe never make those
    enemyActor.SetAttribute("speed", 1); // studs per tick
    enemyActor.SetAttribute("modelOffset", modelOffset);

    // naive way to unique id enemies, maybe use guid? this is guranteed uniqueness unlike guid
    // (guid collision statisically is unlikely... todo implement uuid? or take from a roblox library with uuid)
    // and doesn't overflow until 9.2 quintillion
    // https://stackoverflow.com/questions/78588093/getting-over-the-roblox-leaderstats-intvalue-limit
    this.enemyNumber += 1;
  }

  /**
   * Fires an event to every single enemy actor (ie. makes every enemy think)
   */
  public tick() {
    // TODO? i wonder if we should start computations from front to end to end to front? does it make an appreciable
    // difference? who knows... multithreading makes the game non-determinstic...

    // this task defer means ticks are non-determinstically a different time apart... uhhh i don't know
    // the best analogy is like minecraft ticks are usually 20 per second, but depending on server load this can
    // decrease.
    task.defer(() => {
      // enemies will remove themselves and their actor when they reach the end or die
      this.enemies = this.enemies.filter((enemy) => enemy.GetActor !== undefined);

      this.enemies.forEach((enemy) => {
        // print(enemy.GetActor());
        enemy.GetActor()?.SendMessage("tick");
      });
    });
  }
}
