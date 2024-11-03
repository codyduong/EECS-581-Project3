/**
 * @author Cody Duong <cody.qd@gmail.com>
 */

import React, { useState } from "@rbxts/react";
import { regenerateMap } from "game/modules/events";

interface DebugGameProps {}

export default function DebugGame(_props: DebugGameProps): JSX.Element {
  const [voting, _setVoting] = useState(true);

  return (
    <frame Size={new UDim2(0, 100, 0, 500)}>
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
