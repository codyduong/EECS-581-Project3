/**
 * @prologue
 * @author Kyler Luong, Cody Duong <cody.qd@gmail.com>
 * @file GUI for placing and upgrading towers
 *
 * @precondition N/A
 * @postcondition N/A
 * @invariant N/A
 *
 * @sideeffect Shows an "ephermal" tower for client upon pressing "place" button. Ensure this is cleaned up on crash.
 *             When pressed, sends message to server via {@link requestTower} to create a tower.
 *
 * @throws Any DOM error occurs in the React tree
 *
 * @revisions
 * [2024.October.27]{@revision Initial creation for placing towers}
 * [2024.November.4]{@revision Add upgrade tower}
 * [2024.November.24]{@revision Improve prologue and inline comments (no logical changes)}
 * [2024.December.4]{@revision Add tower stats}
 */

import React, { useEffect, useMemo, useState } from "@rbxts/react";
import { useGame } from "./contexts/GameContext";
import { Tower } from "game/modules/tower/Tower";
import { requestTower } from "game/modules/events";
import { createPortal } from "@rbxts/react-roblox";
import { TICKS_PER_SECOND } from "game/modules/consts";

function anchorModel(model: Model): void {
  model.GetDescendants().forEach((descendant) => {
    if (descendant.IsA("BasePart")) {
      descendant.Anchored = true;
    }
  });
}

// Function to disable any animations or scripts
function disableAnimations(model: Model): void {
  const animator = model.FindFirstChild("Animator") as Animator;
  if (animator) {
    animator.Destroy();
  }

  const humanoid = model.FindFirstChild("Humanoid") as Humanoid;
  if (humanoid) {
    humanoid.PlatformStand = true;
    // Optional: disable other humanoid states that might cause movement
    humanoid.WalkSpeed = 0;
    humanoid.JumpPower = 0;
  }
}

// Function to set transparency for each part in the model
function setModelTransparency(model: Model, transparency: number): void {
  model.GetDescendants().forEach((descendant) => {
    if (descendant.IsA("BasePart")) {
      descendant.Transparency = transparency;
    }
  });
}

const userInputService = game.GetService("UserInputService");
const raycastParams = new RaycastParams();
raycastParams.FilterType = Enum.RaycastFilterType.Exclude;

interface TowerSelectProps {}

export default function TowerSelect(_props: TowerSelectProps): JSX.Element {
  const [placing, setPlacing] = useState<string>();
  const [previewTower, setPreviewTower] = useState<Tower>();
  const [disableRaycast, setDisableRaycast] = useState(false);
  const [selectedTower, setSelectedTower] = useState<Tower>();
  const upgradeCost = useMemo(() => {
    if (selectedTower) {
      const upgradesTo = Tower.getTypeStats(selectedTower.type).upgradesTo;
      if (!upgradesTo) {
        return undefined;
      }
      const upgradeCost = Tower.getTypeStats(upgradesTo).cost;
      return upgradeCost;
    }
  }, [selectedTower]);

  const gameInfo = useGame();

  const part = useMemo(() => new Instance("Part"), []);
  part.Anchored = true;
  part.CanQuery = false;
  part.CanCollide = false;
  part.CastShadow = false;

  const updatePreviewPosition = (part: Part, previewTower: Tower): void => {
    /* TODO, replace with better collision by unioning parts into CGG which is a supported shapecast. -@codyduong */
    const [orientation, size] = previewTower.model.GetBoundingBox();
    part.PivotTo(orientation);
    part.Size = size;
    raycastParams.AddToFilter([previewTower.model, part]);

    const mouseLocation = userInputService.GetMouseLocation();
    const ray = game.Workspace.CurrentCamera?.ViewportPointToRay(mouseLocation.X, mouseLocation.Y);

    if (!ray) {
      return;
    }

    part.Position = ray.Origin;
    const shapecastResult = game.Workspace.Shapecast(part, ray.Direction.mul(1000), raycastParams);

    // combine traditional raycast and shapecast to drop unit from the sky, rather than from character pov
    // const raycastResult = game.Workspace.Raycast(ray.Origin, ray.Direction.mul(1000), raycastParams);
    // if (!raycastResult) {
    //   return;
    // }

    // part.Transparency = 0.5;
    // part.Parent = game.Workspace;
    // part.Position = new Vector3(raycastResult.Position.X, ray.Origin.Y, raycastResult.Position.Z);
    // const shapecastResult = game.Workspace.Shapecast(part, new Vector3(0, -1000, 0), raycastParams);

    if (shapecastResult) {
      previewTower.model.PivotTo(
        // TODO we are off by 0.25, why is this? -@codyduong 2024/11/07
        // ^ this is only true near edges. todo prune edge positions from being allowed -@codyduong 2024/11/14
        new CFrame(shapecastResult.Position)
          .mul(previewTower.model.GetPivot().Rotation)
          .add(new Vector3(0, part.Size.div(2).Y, 0)),
      );
    }
  };

  useEffect(() => {
    const events: RBXScriptConnection[] = [];
    // Update preview position as mouse moves
    if (placing !== undefined && previewTower !== undefined) {
      events.push(
        userInputService.InputChanged.Connect((input) => {
          if (placing !== undefined && input.UserInputType === Enum.UserInputType.MouseMovement) {
            updatePreviewPosition(part, previewTower);
          }
        }),
      );
      events.push(
        userInputService.InputBegan.Connect((input) => {
          if (placing !== undefined && input.UserInputType === Enum.UserInputType.MouseButton1) {
            if (previewTower !== undefined) {
              // setModelTransparency(previewTower, 0); // Set to fully visible
              // anchorModel(previewTower); // Make sure it's anchored
              // disableAnimations(previewTower); // Disable any animations
              // setPreviewTower(undefined); // Clear preview
              requestTower.FireServer(previewTower.toSerializable(), "buy");
              previewTower.Destroy();
            }
            setPreviewTower(undefined);
            setPlacing(undefined);
          }
        }),
      );
    }
    return () => {
      events.forEach((event) => {
        event.Disconnect();
      });
    };
  }, [placing, previewTower, part]);

  useEffect(() => {
    const events: RBXScriptConnection[] = [];
    if (!disableRaycast) {
      events.push(
        userInputService.InputBegan.Connect((input) => {
          if (input.UserInputType === Enum.UserInputType.MouseButton1) {
            const mouseLocation = userInputService.GetMouseLocation();
            const ray = game.Workspace.CurrentCamera?.ViewportPointToRay(mouseLocation.X, mouseLocation.Y);

            if (ray) {
              const result = game.Workspace.Raycast(ray.Origin, ray.Direction.mul(1000), raycastParams);
              if (result && result.Instance) {
                const model = result.Instance.FindFirstAncestorOfClass("Model");
                const towerGuid = model?.GetAttribute("towerGuid");
                if (towerGuid !== undefined) {
                  // this invariant always holds true, unless we set towerGuid wrong
                  assert(typeIs(towerGuid, "string"));
                  let tower = Tower.fromGuid(towerGuid);
                  setSelectedTower(tower);
                } else {
                  setSelectedTower(undefined);
                }
              }
            }
          }
        }),
      );
    }
    return () => {
      events.forEach((event) => {
        event.Disconnect();
      });
    };
  }, [gameInfo.towers, disableRaycast]);

  const sellSelectedTower = (): void => {
    if (selectedTower) {
      requestTower.FireServer(selectedTower.toSerializable(), "sell");
      setSelectedTower(undefined);
    }
  };

  const upgradeSelectedTower = (): void => {
    if (selectedTower) {
      requestTower.FireServer(selectedTower.toSerializable(), "upgrade");
      setSelectedTower(undefined);
    }
  };

  useEffect(() => {
    return () => {
      part.Destroy();
    };
  }, [part]);

  return (
    <>
      <frame Size={new UDim2(0, 300, 0, 50)} Position={new UDim2(0.5, -150, 1, -50)}>
        <textbutton
          Size={new UDim2(0, 100, 0, 50)}
          Position={new UDim2(0, 0, 0, 0)}
          Text={`Place Basic Tower (${Tower.getTypeStats("Noob0").cost} coins)`}
          TextWrapped
          Event={{
            Activated: () => {
              if (placing === undefined) {
                // Clone the "Noob" model as a preview
                const tower = new Tower({ type: "Noob0", ephermal: true });
                const model = tower.model;
                model.Parent = game.Workspace;
                setModelTransparency(model, 0.5); // Make it semi-transparent as a visual cue
                anchorModel(model); // Anchor the preview
                disableAnimations(model); // Disable animations for preview
                setPreviewTower(tower);
                setPlacing(tower.guid);
              } else {
                previewTower?.Destroy();
                setPreviewTower(undefined);
                setPlacing(undefined);
              }
            },
          }}
        />
        <textbutton
          Size={new UDim2(0, 100, 0, 50)}
          Position={new UDim2(0, 100, 0, 0)}
          Text={`Place Bomb Tower (${Tower.getTypeStats("Bomb0").cost} coins)`}
          TextWrapped
          Event={{
            Activated: () => {
              if (placing === undefined) {
                // Clone the "Noob" model as a preview
                const tower = new Tower({ type: "Bomb0", ephermal: true });
                const model = tower.model;
                model.Parent = game.Workspace;
                setModelTransparency(model, 0.5); // Make it semi-transparent as a visual cue
                anchorModel(model); // Anchor the preview
                disableAnimations(model); // Disable animations for preview
                setPreviewTower(tower);
                setPlacing(tower.guid);
              } else {
                previewTower?.Destroy();
                setPreviewTower(undefined);
                setPlacing(undefined);
              }
            },
          }}
        />
        <textbutton
          Size={new UDim2(0, 100, 0, 50)}
          Position={new UDim2(0, 200, 0, 0)}
          Text={"Place Sniper Tower (N/A)"}
          TextWrapped
          Active={false}
          Event={{
            Activated: () => {
              if (placing === undefined) {
                // Clone the "Noob" model as a preview
                const tower = new Tower({ type: "Noob0", ephermal: true });
                const model = tower.model;
                model.Parent = game.Workspace;
                setModelTransparency(model, 0.5); // Make it semi-transparent as a visual cue
                anchorModel(model); // Anchor the preview
                disableAnimations(model); // Disable animations for preview
                setPreviewTower(tower);
                setPlacing(tower.guid);
              } else {
                previewTower?.Destroy();
                setPreviewTower(undefined);
                setPlacing(undefined);
              }
            },
          }}
        />
      </frame>
      {selectedTower &&
        createPortal(
          <billboardgui
            Active
            Size={new UDim2(0, 200, 0, 200)}
            StudsOffset={new Vector3(0, 2, 0)}
            Adornee={selectedTower.model.FindFirstChild("Head")! as BasePart}
          >
            <frame
              Size={new UDim2(1, 0, 0.5, 0)}
              Event={{
                MouseEnter: () => {
                  setDisableRaycast(true);
                },
                MouseLeave: () => {
                  setDisableRaycast(false);
                },
              }}
            >
              <textbutton
                Size={new UDim2(0, 100, 0, 50)}
                Position={new UDim2(0, 0, 0, 0)}
                Text={`Sell (${math.floor(Tower.getTypeStats(selectedTower.type).cost * 0.5)} coins)`}
                Event={{
                  Activated: () => {
                    setDisableRaycast(false);
                    sellSelectedTower();
                  },
                }}
              />
              {upgradeCost !== undefined && (
                <textbutton
                  Size={new UDim2(0, 100, 0, 50)}
                  Position={new UDim2(0, 0, 0, 50)}
                  Text={`Upgrade (${upgradeCost} coins)`}
                  Event={{
                    Activated: () => {
                      setDisableRaycast(false);
                      upgradeSelectedTower();
                    },
                  }}
                />
              )}
              <frame Position={new UDim2(0, 100, 0, 0)} Size={new UDim2(0, 100, 0, 100)}>
                <uilistlayout FillDirection="Vertical" />
                <textlabel
                  Size={new UDim2(0, 100, 0, 25)}
                  Text={`Damage: ${Tower.getTypeStats(selectedTower.type).damage}`}
                />
                <textlabel
                  Size={new UDim2(0, 100, 0, 25)}
                  Text={`Range: ${Tower.getTypeStats(selectedTower.type).range}`}
                />
                <textlabel
                  Size={new UDim2(0, 100, 0, 25)}
                  Text={`Attacks/Second: ${TICKS_PER_SECOND / Tower.getTypeStats(selectedTower.type).ticksBetweenAttacks}`}
                />
              </frame>
            </frame>
          </billboardgui>,
          game.GetService("Players").LocalPlayer.FindFirstChild("PlayerGui")!,
        )}
    </>
  );
}
