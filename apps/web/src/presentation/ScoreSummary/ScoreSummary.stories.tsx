import type { Meta, StoryObj } from "@storybook/react-vite";
import ScoreSummary from "./ScoreSummary";

const meta: Meta<typeof ScoreSummary> = {
  title: "Golf/ScoreSummary",
  component: ScoreSummary,
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof ScoreSummary>;

export const Even: Story = {
  name: "イーブンパー",
  render: () => (
    <div className="w-full max-w-[420px]">
      <ScoreSummary totalScore={36} toPar={0} birdies={2} pars={5} bogeys={2} />
    </div>
  ),
};

export const UnderPar: Story = {
  name: "アンダーパー",
  render: () => (
    <div className="w-full max-w-[420px]">
      <ScoreSummary totalScore={34} toPar={-2} birdies={3} pars={5} bogeys={1} />
    </div>
  ),
};

export const OverPar: Story = {
  name: "オーバーパー",
  render: () => (
    <div className="w-full max-w-[420px]">
      <ScoreSummary totalScore={40} toPar={4} birdies={1} pars={4} bogeys={4} />
    </div>
  ),
};

export const NoScore: Story = {
  name: "スコアなし",
  render: () => (
    <div className="w-full max-w-[420px]">
      <ScoreSummary totalScore={0} toPar={0} birdies={0} pars={0} bogeys={0} />
    </div>
  ),
};
