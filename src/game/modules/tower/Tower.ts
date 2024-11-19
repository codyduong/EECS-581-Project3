/**
 * @prologue
 *
 * @author Cody Duong
 *
 * @file Tower Class used for handling Towers on the server and client. Manages how it looks and its stats.
 *       AI and animation are controlled by a seperate controller on TowerSupervisor, due to communication sync
 *       required. (IE. it is easy to propogate client->server on the Tower class, it is much harder to propogate server
 *       ->client from within this class, hence the existence of TowerSupervisor)
 *
 * @precondition N/A
 *
 * @postcondition N/A
 *
 * @invariant N/A
 *
 * @throws N/A
 *
 * @sideeffect {@link guidToTowerMap}
 *
 * @revisions
 * [2024.November.4]{@revision Initial tower class (simple placement and selling)}
 * [2024.November.11]{@revision Add tower upgrading}
 * [2024.November.18]{@revision Improve prologue and inline comments (no logical changes)}
 */

import { Noob0Model, Noob1Model, NoobStats } from "./noob";

export type TowerType = "Noob";

export type TowerStats = {
  damage: number;
  ticksBetweenAttacks: number; // see TICK_DELAY
  attackType: "raycast"; // todo add other attack variants like projectile (ie. moving towards, or constant attacks like a poision field)
  range: number; // Range in studs;
};

export type TowerProps = {
  guid?: string;
  cframe?: CFrame;
  // TODO use automatic literals from derived towers
  type: TowerType;
  ephermal?: boolean; // will not be stored in guidToTowerMap
};

const guidToTowerMap = new Map<string, Tower>();

export type TowerPropsSerializable = Omit<TowerProps, "ephermal"> & { guid: string; level: number };

export class Tower {
  readonly guid: string;
  model: Model;
  readonly type: TowerType;
  level: number; // tower level
  private destroyed = false;

  /**
   * Creates a tower
   *
   * @sideeffect Every non-ephermal tower will be stored permanently in the guidToTowerMap
   *             @todo I just realized this, but we never remove towers from guidToTowerMap. Chance of intersection is
   *             near zero and practically zero, but in the Destroy call we should remove the tower as well. -codyduong 2024, Nov 11
   *
   * @throws Invalid tower type
   */
  constructor(props: TowerProps) {
    this.guid = props.guid ?? game.GetService("HttpService").GenerateGUID();
    this.type = props.type;
    this.level = 0;
    switch (props.type) {
      case "Noob":
        this.model = Noob0Model.Clone();
        this.model.SetAttribute("towerGuid", this.guid);
        break;
      default:
        error("Unknown tower type");
    }
    // Setup the model in the world cframe if it exists
    if (props.cframe) {
      this.model.PivotTo(props.cframe);
    }
    // If ephermal don't store in the guidToTowerMap
    if (!props.ephermal) {
      guidToTowerMap.set(this.guid, this);
    }
  }

  /**
   * Private utility assertion
   * @throws Errors if already destroyed
   */
  private assertNotDestroyed(): void {
    assert(this.destroyed === false, "This tower had Destroy() called. No further operations permitted");
  }

  /**
   * Destroys this tower and makes it unavailable for any other operation
   * @precondition Is not destroyed
   * @throws Errors if already destroyed
   */
  public Destroy(): void {
    this.assertNotDestroyed();
    this.destroyed = true;
    this.model.Destroy();
  }

  /**
   * Used for passing into RemoteEvent (or any "wire" communication between client/server, client/client)
   * {@link https://create.roblox.com/docs/reference/engine/classes/RemoteEvent RemoteEvent} only accepts a subset of types
   *
   * @precondition Is not destroyed
   * @throws Errors if already destroyed
   */
  public toSerializable(): TowerPropsSerializable {
    this.assertNotDestroyed();
    return {
      guid: this.guid,
      cframe: this.model.GetPivot(),
      type: this.type,
      level: this.level,
    };
  }

  /**
   * Upgrades the tower
   *
   * @precondition Is not destroyed
   * @throws Errors if already destroyed
   *
   * @todo this is primititive and simply only levels once, and manually changes the NoobModel -codyduong 2024 nov 11
   */
  public upgrade(): void {
    this.assertNotDestroyed();
    this.level += 1;
    if (this.level > 0) {
      const oldModel = this.model;
      this.model = Noob1Model.Clone();
      this.model.PivotTo(oldModel.GetPivot());
      this.model.SetAttribute("towerGuid", this.guid);
      oldModel.Destroy();
    }
  }

  /**
   * Attempts to find the guid in the current execution context (ie. the server or client)
   * @param {string} guid obtained from {@link https://create.roblox.com/docs/reference/engine/classes/HttpService#GenerateGUID GenerateGuid}
   */
  public static fromGuid(guid: string): Tower | undefined {
    assert(guid !== undefined); // todo is this assertion necessary, this should be guarded by the compiler -codyduong
    return guidToTowerMap.get(guid);
  }

  /**
   * Return some stats about this tower based on its type
   *
   * @todo this should either be a instance method, or a private static method + instance method
   */
  public static getTypeStats(t: TowerType): TowerStats {
    switch (t) {
      // TODO this depends on level as well.
      case "Noob":
        return NoobStats;
      default:
        error("Unknown tower type");
    }
  }
}
