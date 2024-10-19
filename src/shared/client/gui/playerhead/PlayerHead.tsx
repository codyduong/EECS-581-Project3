import React, { useState } from "@rbxts/react";

interface PlayerHeadProps {
  initialCount?: number;
}

export default function PlayerHead({ initialCount = 0 }: PlayerHeadProps) {
  const [count, setCount] = useState(initialCount);

  return (
    <frame Size={new UDim2(1, 0, 0.5, 0)}>
      <textbutton
        Text={`Count: ${count}`}
        AnchorPoint={new Vector2(0.5, 0.5)}
        Size={new UDim2(0, 100, 0, 50)}
        Position={new UDim2(0.5, 0, 0.5, 0)}
        Event={{
          Activated: () => setCount(count + 1),
        }}
      />
    </frame>
  );
}
