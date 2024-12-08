/**
 * @prologue
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Shows information about coins
 *
 * @precondition N/A
 * @postcondition N/A
 * @invariant N/A
 * @sideeffect N/A
 *
 * @throws Any DOM error occurs in the React tree
 *
 * @revisions
 * [2024.October.27]{@revision Initial creation to support displaying coins}
 * [2024.November.11]{@revision Wrap in frame for better sibling DOM hierarchy}
 * [2024.November.24]{@revision Improve prologue and inline comments (no logical changes)}
 */

import React from "@rbxts/react";
import { useGame } from "./contexts/GameContext";
import Frame from "shared/client/gui/frame";

type IconWithLabelProps = {
  icon: `rbxassetid://${number}`;
  label: string;
  iconSize?: UDim2;
  labelSize?: UDim2;
} & React.InstanceProps<Frame>;

// it is possible for keys to be missing...
// union to tuple not rec: https://stackoverflow.com/a/55128956
const FRAME_KEYS = [
  "ref",
  "key",
  "children",
  "Style",
  "Active",
  "AnchorPoint",
  "AutomaticSize",
  "BackgroundColor",
  "BackgroundColor3",
  "BackgroundTransparency",
  "BorderColor",
  "BorderColor3",
  "BorderMode",
  "BorderSizePixel",
  "ClipsDescendants",
  "Draggable",
  "Interactable",
  "LayoutOrder",
  "NextSelectionDown",
  "NextSelectionLeft",
  "NextSelectionRight",
  "NextSelectionUp",
  "Position",
  "Rotation",
  "Selectable",
  "SelectionImageObject",
  "SelectionOrder",
  "Size",
  "SizeConstraint",
  "Transparency",
  "Visible",
  "ZIndex",
  "AutoLocalize",
  "Localize",
  "RootLocalizationTable",
  "SelectionBehaviorDown",
  "SelectionBehaviorLeft",
  "SelectionBehaviorRight",
  "SelectionBehaviorUp",
  "SelectionGroup",
  "Archivable",
  "Event",
  "Change",
  "Tag",
] as const satisfies (keyof React.InstanceProps<Frame>)[];

const IconWithLabel = (props: IconWithLabelProps): JSX.Element => {
  const { icon, label, iconSize = new UDim2(0, 48, 0, 48), labelSize = new UDim2(0, 144, 0, 48) } = props;

  const rest: Record<string, unknown> = {};
  for (const [k, v] of pairs(props)) {
    if (k in FRAME_KEYS) {
      rest[k] = v;
    }
  }

  return (
    <frame Size={labelSize} BorderSizePixel={0} BackgroundTransparency={1} {...rest}>
      <uipadding PaddingLeft={new UDim(0, 16)} />
      <uilistlayout FillDirection={"Horizontal"} SortOrder={"LayoutOrder"} />
      <imagelabel LayoutOrder={0} Size={iconSize} Image={icon} BorderSizePixel={0} BackgroundTransparency={1} />
      <textlabel
        LayoutOrder={1}
        Size={new UDim2(0, labelSize.X.Offset - iconSize.X.Offset, 1, 0)}
        Text={label}
        BorderSizePixel={0}
        BackgroundTransparency={1}
        TextColor3={new Color3(1, 1, 1)}
        TextSize={24}
        TextStrokeTransparency={0.5}
      >
        <uipadding PaddingLeft={new UDim(0, 8)} />
      </textlabel>
    </frame>
  );
};

interface CoinsProps {}

export default function Coins(_props: CoinsProps): JSX.Element {
  const gameInfo = useGame();

  const frameSize = new UDim2(0, 144, 0, 144);

  return (
    <Frame
      Size={frameSize}
      Position={new UDim2(0, 0, 0.05, 0)}
      ClipsDescendants
      BorderSizePixel={0}
      BackgroundTransparency={1}
    >
      <uilistlayout FillDirection={"Vertical"} SortOrder={"LayoutOrder"} />
      <IconWithLabel
        LayoutOrder={0}
        icon={"rbxassetid://17368060122"}
        label={`${gameInfo.coins[`${game.GetService("Players").LocalPlayer.UserId}`]}`}
      />
      <IconWithLabel LayoutOrder={1} icon={"rbxassetid://17368075795"} label={`${gameInfo.health}`} />
      <IconWithLabel LayoutOrder={2} icon={"rbxassetid://17368087730"} label={`${gameInfo.wave}`} />
    </Frame>
  );
}
