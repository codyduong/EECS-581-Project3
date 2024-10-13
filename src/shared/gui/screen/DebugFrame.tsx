import React from "@rbxts/react";

interface DebugFrameProps {

}

export default function DebugFrame(props: DebugFrameProps): JSX.Element {

  return <frame
      Size={new UDim2(0, 100, 0, 500)}
    >
      <uilistlayout
        FillDirection={"Vertical"}
      />
      <textbox Text={"Debug Menu"}
        Size={new UDim2(0, 100, 0, 50)}
        Interactable={false}
      />
      <textbutton Text={"Reset datastore"}
			Size={new UDim2(0, 100, 0, 50)}
			Event={{
				Activated: () => {
          print("[DEBUG] resetting datastore")
        },
			}}/>
  </frame>
}