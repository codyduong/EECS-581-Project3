import Noob from "./noob";

export type TowerType = "Noob";

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
  constructor(props: TowerProps) {
    this.guid = props.guid ?? game.GetService("HttpService").GenerateGUID();
    this.type = props.type;
    switch (props.type) {
      case "Noob":
        this.model = Noob.Clone();
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

  private assertNotDestroyed() {
    assert(this.destroyed === false, "This tower had Destroy() called. No further operations permitted");
  }

  public Destroy() {
    this.assertNotDestroyed();
    this.destroyed = true;
    this.model.Destroy();
  }

  /**
   * RemoteEvents only accept a subset of types.
   */
  public toSerializable(): TowerPropsSerializable {
    this.assertNotDestroyed();
    return {
      guid: this.guid,
      cframe: this.model.GetPivot(),
      type: this.type,
    };
  }

  public static fromGuid(guid: string): Tower | undefined {
    assert(guid !== undefined);
    return guidToTowerMap.get(guid);
  }
}
