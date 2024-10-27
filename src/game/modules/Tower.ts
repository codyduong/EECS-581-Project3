import Noob from "./noob"

export type TowerType = "Noob"

export type TowerProps = {
  guid?: string
  cframe?: CFrame
  // TODO use automatic literals from derived towers
  type: TowerType
} 

export type TowerPropsSerializable = NonNullable<TowerProps>;

export class Tower {
  readonly guid: string
  readonly model: Model
  readonly type: TowerType
  private destroyed = false;
  constructor(props: TowerProps) {
    this.guid = props.guid ?? game.GetService("HttpService").GenerateGUID()
    this.type = props.type
    switch (props.type) {
      case "Noob":
        this.model = Noob.Clone()
        break;
      default:
        error("Unknown tower type")
    }
    if (props.cframe) {
      this.model.PivotTo(props.cframe)
    }
  }

  private assertNotDestroyed() {
    assert(this.destroyed === false, "This tower had Destroy() called. No further operations permitted")
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
      type: this.type
    }
  }
}