/**
 * @author Kyler Luong, Cody Duong <cody.qd@gmail.com>
 * @file Gui element for drag and drop
 */

import React, { useEffect, useState } from "@rbxts/react";
import Noob from "game/modules/noob";

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
  const [placingNoob, setPlacingNoob] = useState(false);
  const [previewTower, setPreviewTower] = useState<Model>();
  const part = new Instance("Part");
  part.Anchored = true;

  const updatePreviewPosition = () => {
    const mouseLocation = userInputService.GetMouseLocation();
    const ray = game.Workspace.CurrentCamera?.ViewportPointToRay(mouseLocation.X, mouseLocation.Y);

    if (ray && previewTower) {
      part.Position = ray.Origin;
      const shapecastResult = game.Workspace.Shapecast(part, ray.Direction.mul(1000), raycastParams);

      if (shapecastResult) {
        previewTower.PivotTo(
          new CFrame(shapecastResult.Position).mul(noobTemplateRotation).add(new Vector3(0, part.Size.div(2).Y, 0)),
        );
      }
    }
  };

  useEffect(() => {
    if (previewTower) {
      /* TODO, replace with better collision by unioning parts into CGG which is a supported shapecast. -@codyduong */
      const [orientation, size] = previewTower.GetBoundingBox();
      part.PivotTo(orientation);
      part.Size = size;
      raycastParams.AddToFilter([previewTower, part]);
    }
  }, [previewTower]);

  const events: RBXScriptConnection[] = [];
  useEffect(() => {
    // Update preview position as mouse moves
    if (placingNoob && previewTower) {
      events.push(
        userInputService.InputChanged.Connect((input) => {
          if (placingNoob && input.UserInputType === Enum.UserInputType.MouseMovement) {
            updatePreviewPosition();
          }
        }),
      );
      events.push(
        userInputService.InputBegan.Connect((input) => {
          if (placingNoob && input.UserInputType === Enum.UserInputType.MouseButton1) {
            if (previewTower) {
              setModelTransparency(previewTower, 0); // Set to fully visible
              anchorModel(previewTower); // Make sure it's anchored
              disableAnimations(previewTower); // Disable any animations
              setPreviewTower(undefined); // Clear preview
            }
            setPlacingNoob(false); // Exit placement mode
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
  }, [placingNoob, previewTower]);

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
          if (placingNoob === false) {
            // Clone the "Noob" model as a preview
            const tower = noobTemplate.Clone();
            tower.Parent = game.Workspace;
            setModelTransparency(tower, 0.5); // Make it semi-transparent as a visual cue
            anchorModel(tower); // Anchor the preview
            disableAnimations(tower); // Disable animations for preview
            setPreviewTower(tower);
          } else {
            previewTower?.Destroy();
            setPreviewTower(undefined);
          }
          setPlacingNoob((prev) => !prev);
        },
      }}
    />
  );
}
