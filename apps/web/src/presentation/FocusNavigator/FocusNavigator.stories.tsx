import type { Meta, StoryObj } from "@storybook/react-vite";
import FocusNavigator from "./FocusNavigator";

const meta: Meta<typeof FocusNavigator> = {
  title: "Golf/FocusNavigator",
  component: FocusNavigator,
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof FocusNavigator>;

export const Up: Story = {
  args: {
    direction: "up",
    onClick: () => console.log("Up clicked"),
    disabled: false,
  },
};

export const Down: Story = {
  args: {
    direction: "down",
    onClick: () => console.log("Down clicked"),
    disabled: false,
  },
};

export const UpDisabled: Story = {
  args: {
    direction: "up",
    onClick: () => console.log("Up clicked"),
    disabled: true,
  },
};

export const DownDisabled: Story = {
  args: {
    direction: "down",
    onClick: () => console.log("Down clicked"),
    disabled: true,
  },
};

export const BothDirections: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4">
      <FocusNavigator
        direction="up"
        onClick={() => console.log("Up clicked")}
        disabled={false}
      />
      <div className="text-sm text-gray-600">Focus area</div>
      <FocusNavigator
        direction="down"
        onClick={() => console.log("Down clicked")}
        disabled={false}
      />
    </div>
  ),
};
