import type { Meta, StoryObj } from "@storybook/react-vite";
import ScoreInput from "./ScoreInput";
import { useState } from "react";

const meta: Meta<typeof ScoreInput> = {
  title: "Golf/ScoreInput",
  component: ScoreInput,
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof ScoreInput>;

export const Empty: Story = {
  render: () => {
    const [value, setValue] = useState<number | undefined>(undefined);
    return (
      <ScoreInput
        value={value}
        par={4}
        onChange={setValue}
      />
    );
  },
};

export const WithValue: Story = {
  render: () => {
    const [value, setValue] = useState<number | undefined>(5);
    return (
      <ScoreInput
        value={value}
        par={4}
        onChange={setValue}
      />
    );
  },
};

export const Par3: Story = {
  render: () => {
    const [value, setValue] = useState<number | undefined>(undefined);
    return (
      <ScoreInput
        value={value}
        par={3}
        onChange={setValue}
      />
    );
  },
};

export const Par5: Story = {
  render: () => {
    const [value, setValue] = useState<number | undefined>(undefined);
    return (
      <ScoreInput
        value={value}
        par={5}
        onChange={setValue}
      />
    );
  },
};

export const AtMinimum: Story = {
  render: () => {
    const [value, setValue] = useState<number | undefined>(1);
    return (
      <ScoreInput
        value={value}
        par={4}
        onChange={setValue}
        min={1}
      />
    );
  },
};

export const AtMaximum: Story = {
  render: () => {
    const [value, setValue] = useState<number | undefined>(15);
    return (
      <ScoreInput
        value={value}
        par={4}
        onChange={setValue}
        max={15}
      />
    );
  },
};
