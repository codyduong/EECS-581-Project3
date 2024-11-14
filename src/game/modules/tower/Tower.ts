/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Tower Class
 */

import Noob from "./noob";
import Rig from "./rig"
export type TowerType = "Noob" | "Rig";
import Rig from "./rig";
export type TowerType = "Noob";

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
   */
  constructor(props: TowerProps) {
    this.guid = props.guid ?? game.GetService("HttpService").GenerateGUID();
    this.type = props.type;
    this.level = 0;
    switch (props.type) {
      case "Noob":
        this.model = Noob.Clone();
        this.model.SetAttribute("towerGuid", this.guid);
        break;
        case "Rig":
          this.model = Rig.Clone();
          this.model.SetAttribute("towerGuid", this.guid);
          break;
      default:
        error("Unknown tower type");
    }
    if (props.cframe) {
      this.model.PivotTo(props.cframe);
    }
    if (!props.ephermal) {
      guidToTowerMap.set(this.guid, this);
    }
  }

  /**
   * @throws Errors if already destroyed
   */
  private assertNotDestroyed(): void {
    assert(this.destroyed === false, "This tower had Destroy() called. No further operations permitted");
  }

  /**
   * Destroys this tower and makes it unavailable for any other operation
   */
  public Destroy(): void {
    this.assertNotDestroyed();
    this.destroyed = true;
    this.model.Destroy();
  }

  /**
   * {@link https://create.roblox.com/docs/reference/engine/classes/RemoteEvent RemoteEvent} only accepts a subset of types
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
   * Attempts to find the guid in the current execution context
   * @param {string} guid obtained from {@link https://create.roblox.com/docs/reference/engine/classes/HttpService#GenerateGUID GenerateGuid}
   */
  public static fromGuid(guid: string): Tower | undefined {
    assert(guid !== undefined);
    return guidToTowerMap.get(guid);
  }

  public upgrade(): void {
    this.level += 1;
    if (this.level > 0) {
      const oldModel = this.model;
      this.model = Rig.Clone();
      this.model.PivotTo(oldModel.GetPivot());
      this.model.SetAttribute("towerGuid", this.guid);
      oldModel.Destroy();
    }
  }
}
