/**
 * @author Kyler Luong, Cody Duong <cody.qd@gmail.com>
 * @file Gui element for drag and drop
 */

import React, { useEffect, useState } from "@rbxts/react";
import Noob from "game/modules/noob";
import { useGame } from "./contexts/GameContext";
import { Tower } from "game/modules/Tower";
import { requestTower } from "game/modules/events";

function anchorModel(model: Model) {
  model.GetDescendants().forEach((descendant) => {
    if (descendant.IsA("BasePart")) {
      descendant.Anchored = true;
    }
  });
}

// Function to disable any animations or scripts
function disableAnimations(model: Model) {
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
function setModelTransparency(model: Model, transparency: number) {
  model.GetDescendants().forEach((descendant) => {
    if (descendant.IsA("BasePart")) {
      descendant.Transparency = transparency;
    }
  });
}

const userInputService = game.GetService("UserInputService");
const noobTemplate: Model = Noob.Clone();
const noobTemplateRotation = noobTemplate.GetPivot().Rotation;
const raycastParams = new RaycastParams();
raycastParams.FilterType = Enum.RaycastFilterType.Exclude;

interface PlaceProps {}

export default function Place(_props: PlaceProps): JSX.Element {
  const [placing, setPlacing] = useState<string>();
  const [previewTower, setPreviewTower] = useState<Tower>();
  const gameInfo = useGame();
  const part = new Instance("Part");
  part.Anchored = true;

  const updatePreviewPosition = () => {
    const mouseLocation = userInputService.GetMouseLocation();
    const ray = game.Workspace.CurrentCamera?.ViewportPointToRay(mouseLocation.X, mouseLocation.Y);

    if (ray && previewTower) {
      part.Position = ray.Origin;
      const shapecastResult = game.Workspace.Shapecast(part, ray.Direction.mul(1000), raycastParams);

      if (shapecastResult) {
        previewTower.model.PivotTo(
          new CFrame(shapecastResult.Position).mul(noobTemplateRotation).add(new Vector3(0, part.Size.div(2).Y, 0)),
        );
      }
    }
  };

  useEffect(() => {
    if (previewTower) {
      /* TODO, replace with better collision by unioning parts into CGG which is a supported shapecast. -@codyduong */
      const [orientation, size] = previewTower.model.GetBoundingBox();
      part.PivotTo(orientation);
      part.Size = size;
      raycastParams.AddToFilter([previewTower.model, part]);
    }
  }, [previewTower]);

  const events: RBXScriptConnection[] = [];
  useEffect(() => {
    // Update preview position as mouse moves
    if (placing !== undefined && previewTower) {
      events.push(
        userInputService.InputChanged.Connect((input) => {
          if (placing && input.UserInputType === Enum.UserInputType.MouseMovement) {
            updatePreviewPosition();
          }
        }),
      );
      events.push(
        userInputService.InputBegan.Connect((input) => {
          if (placing !== undefined && input.UserInputType === Enum.UserInputType.MouseButton1) {
            if (previewTower) {
              // setModelTransparency(previewTower, 0); // Set to fully visible
              // anchorModel(previewTower); // Make sure it's anchored
              // disableAnimations(previewTower); // Disable any animations
              // setPreviewTower(undefined); // Clear preview
              requestTower.FireServer(previewTower.toSerializable(), "buy");
              previewTower.Destroy();
            }
            setPreviewTower(undefined);
            setPlacing(undefined);
            part.Destroy();
          }
        }),
      );
    }
    return () => {
      events.forEach((event) => {
        event.Disconnect();
      });
    };
  }, [placing, previewTower]);

  useEffect(() => {
    print("changed", gameInfo)
  }, [gameInfo])

  useEffect(() => {
    return () => {
      part.Destroy();
    };
  }, []);

  return (
    <textbutton
      Size={new UDim2(0, 100, 0, 50)}
      Position={new UDim2(0.5, -50, 1, -50)}
      Text={"Place Tower"}
      Event={{
        Activated: () => {
          if (placing === undefined) {
            // Clone the "Noob" model as a preview
            const tower = new Tower({type: "Noob"})
            const model = tower.model
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
  );
}
