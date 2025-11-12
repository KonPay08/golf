import type { Meta, StoryObj } from "@storybook/react-vite";
import CreateRoundModal from "./CreateRoundModal";
import { useState } from "react";

const meta: Meta<typeof CreateRoundModal> = {
  title: "Presentation/CreateRoundModal",
  component: CreateRoundModal,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors"
        >
          モーダルを開く
        </button>
        <CreateRoundModal
          open={open}
          onOpenChange={setOpen}
          onSubmit={(data) => {
            console.log("Submit:", data);
            setOpen(false);
          }}
        />
      </>
    );
  },
};

export const Closed: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors"
        >
          モーダルを開く
        </button>
        <CreateRoundModal
          open={open}
          onOpenChange={setOpen}
          onSubmit={(data) => {
            console.log("Submit:", data);
            setOpen(false);
          }}
        />
      </>
    );
  },
};

export const WithNineHoles: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors"
        >
          モーダルを開く
        </button>
        <CreateRoundModal
          open={open}
          onOpenChange={setOpen}
          onSubmit={(data) => {
            console.log("Submit:", data);
            alert(`ラウンド作成: ${data.playedAt}, ${data.holeCount}ホール`);
            setOpen(false);
          }}
        />
      </>
    );
  },
};
