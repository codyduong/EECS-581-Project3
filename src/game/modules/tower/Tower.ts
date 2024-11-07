/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Tower Class
 */

import Noob from "./noob";
import Rig from "./rig"
export type TowerType = "Noob" | "Rig";

export type TowerProps = {
  guid?: string;
  cframe?: CFrame;
  // TODO use automatic literals from derived towers
  type: TowerType;
  ephermal?: boolean; // will not be stored in guidToTowerMap
};

const guidToTowerMap = new Map<string, Tower>();

export type TowerPropsSerializable = Omit<TowerProps, "ephermal"> & { guid: string };

export class Tower {
  readonly guid: string;
  readonly model: Model;
  readonly type: TowerType;
  private destroyed = false;

  /**
   * Creates a tower
   */
  constructor(props: TowerProps) {
    this.guid = props.guid ?? game.GetService("HttpService").GenerateGUID();
    this.type = props.type;
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
}
