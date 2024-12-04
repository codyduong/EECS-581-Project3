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
 * [2024.October.27]{@revision Initial creation to support gui in the game}
 * [2024.November.4]{@revision Cleanup some comments (no logical changes)}
 * [2024.November.24]{@revision Improve prologue and inline comments (no logical changes)}
 */

import React, { useState } from "@rbxts/react";
import { regenerateMap } from "game/modules/events";

interface DebugGameProps {}

export default function DebugGame(_props: DebugGameProps): JSX.Element {
  const [voting, _setVoting] = useState(true);

  return (
    <frame Size={new UDim2(0, 100, 0, 500)} Position={new UDim2(1, -100, 0, 0)}>
      <uilistlayout FillDirection={"Vertical"} />
      <textbox Text={"Debug Menu"} Size={new UDim2(0, 100, 0, 50)} Interactable={false} />
      <textbutton
        Text={`Regenerate Map`}
        Size={new UDim2(0, 100, 0, 50)}
        Event={{
          Activated: () => {
            print("[DEBUG] regenerating map with new seed");
            regenerateMap.FireServer(voting);
            // setVoting((prev) => !prev);
          },
        }}
      />
    </frame>
  );
}
