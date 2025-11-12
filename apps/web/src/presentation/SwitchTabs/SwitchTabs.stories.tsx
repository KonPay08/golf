import type { Meta, StoryObj } from "@storybook/react-vite";
import SwitchTabs, { type HalfTab } from "./SwitchTabs";
import { useState } from "react";

const meta: Meta<typeof SwitchTabs> = {
  title: "Golf/SwitchTabs",
  component: SwitchTabs,
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof SwitchTabs>;

export const Default: Story = {
  render: () => {
    const [tab, setTab] = useState<HalfTab>("OUT");
    return (
      <SwitchTabs
        value={tab}
        onChange={setTab}
        className="w-[280px]"
      />
    );
  },
};
