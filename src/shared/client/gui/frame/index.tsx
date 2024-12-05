import React from "@rbxts/react";
import { useUI } from "shared/client/gui/contexts/UIContext";

const Frame = (props: React.InstanceProps<Frame>): JSX.Element => {
  const { enterUI, exitUI } = useUI();
  const mergedEvent = {
    ...props.Event,
    MouseEnter: (...args) => {
      props.Event?.MouseEnter?.(...args);
      enterUI();
    },
    MouseLeave: (...args) => {
      props.Event?.MouseLeave?.(...args);
      exitUI();
    },
  } satisfies React.InstanceEvent<Frame>;

  return <frame {...props} Event={mergedEvent} />;
};

export default Frame;
