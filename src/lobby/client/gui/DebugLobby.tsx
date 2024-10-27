import React from "@rbxts/react";
import { usePlayerData } from "shared/client/gui/contexts/PlayerDataContext";

interface DebugLobbyProps {}

export default function DebugLobby(_props: DebugLobbyProps): JSX.Element {
  const data = usePlayerData();

  print(data);

  return (
    <frame Size={new UDim2(0, 100, 0, 500)}>
      <uilistlayout FillDirection={"Vertical"} />
      <textbox Text={"Debug Menu"} Size={new UDim2(0, 100, 0, 50)} Interactable={false} />
      <textbutton
        Text={"Reset datastore"}
        Size={new UDim2(0, 100, 0, 50)}
        Event={{
          Activated: () => {
            print("[DEBUG] resetting datastore, TODO @codyduong implement this");
          },
        }}
      />
    </frame>
  );
}
