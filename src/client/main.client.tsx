import React, { StrictMode } from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import PlayerHeadGui from "shared/gui/playerhead";
import ScreneGui from "shared/gui/screen";

const root = createRoot(new Instance("Folder"));
root.render(<StrictMode>
	<ScreneGui />
	<PlayerHeadGui />
</StrictMode>);
