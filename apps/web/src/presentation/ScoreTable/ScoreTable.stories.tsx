// src/components/ScoreTable.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import ScoreTable, { type Column, type ScoreRow } from "./ScoreTable";

/** Storybook メタ */
const meta: Meta<typeof ScoreTable> = {
  title: "Golf/ScoreTable",
  component: ScoreTable,
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof ScoreTable>;

/** 9ホールのダミー */
const baseRows: ScoreRow[] = [
  { hole: 1, par: 4, score: 4 },
  { hole: 2, par: 4, score: 4 },
  { hole: 3, par: 3, score: 3 },
  { hole: 4, par: 5, score: 5 },
  { hole: 5, par: 5, score: 5 },
  { hole: 6, par: 5 },
  { hole: 7, par: 4 },
  { hole: 8, par: 4 },
  { hole: 9, par: 4, score: 4 },
];

const columns3: Column<ScoreRow>[] = [
  { id: "hole",  header: "ホール", grow: 1,   align: "center",  cell: r => r.hole },
  { id: "par",   header: "Par",   grow: 1,   align: "center", numeric: true, cell: r => r.par },
  { id: "score", header: "スコア",grow: 1,   align: "center", numeric: true, cell: r => r.score ?? "−" },
];


export const ThreeColumns: Story = {
  name: "基本（3カラム・重み付き）",
  render: () => {
    const [focused, setFocused] = useState(4);
    return (
      <div className="w-full max-w-[420px]">
        <ScoreTable rows={baseRows} columns={columns3} focusedIndex={focused} onFocusChange={setFocused} />
        <p className="mt-3 text-sm text-muted">フォーカス行: {focused + 1}</p>
      </div>
    );
  },
};

/* ---- 追加列ありの型（Story専用） ---- */
type ExtRow = ScoreRow & { putts?: number; fir?: boolean; gir?: boolean };

const columnsExt: Column<ExtRow>[] = [
  // 既存3列
  { id: "hole",  header: "ホール", grow: 0.8, align: "left",  cell: (r) => r.hole },
  { id: "par",   header: "Par",   grow: 1.0, align: "right", numeric: true, cell: (r) => r.par },
  { id: "score", header: "スコア", grow: 1.2, align: "right", numeric: true, cell: (r) => r.score ?? "−" },
  // 追加列（例）
  { id: "putts", header: "PT",    grow: 0.9, align: "right",  numeric: true, cell: (r) => r.putts ?? "−" },
  { id: "fir",   header: "FIR",   grow: 0.9, align: "center",                cell: (r) => (r.fir ? "○" : "—") },
  { id: "gir",   header: "GIR",   grow: 0.9, align: "center",                cell: (r) => (r.gir ? "○" : "—") },
];

export const WithExtraColumns: Story = {
  name: "拡張（Putts / FIR / GIR 付き）",
  render: () => {
    const rows: ExtRow[] = [
      { hole: 1, par: 4, score: 4, putts: 2, fir: true,  gir: true },
      { hole: 2, par: 4, score: 4, putts: 2, fir: false, gir: false },
      { hole: 3, par: 3, score: 3, putts: 1, fir: true,  gir: true },
      { hole: 4, par: 5, score: 5, putts: 2, fir: true,  gir: false },
      { hole: 5, par: 5, score: 5, putts: 2, fir: false, gir: true },
      { hole: 6, par: 5,               putts: 2, fir: false, gir: false },
      { hole: 7, par: 4,                              fir: true,  gir: false },
      { hole: 8, par: 4,                              fir: false, gir: true },
      { hole: 9, par: 4, score: 4, putts: 2, fir: true,  gir: true },
    ];
    return (
      <div className="w-full max-w-[520px]">
        {/* ジェネリクスで ExtRow を指定 */}
        <ScoreTable<ExtRow> rows={rows} columns={columnsExt} focusedIndex={4} />
      </div>
    );
  },
};

/* 均等幅で見たい場合は grow を全て 1 にした配列を渡してください。
const columnsEqual: Column<ScoreRow>[] = [
  { id: "hole", header: "ホール", min: 56, grow: 1, align: "left",  cell: r => r.hole },
  { id: "par",  header: "Par",   min: 56, grow: 1, align: "right", numeric: true, cell: r => r.par },
  { id: "score",header: "スコア",min: 80, grow: 1, align: "right", numeric: true, cell: r => r.score ?? "−" },
];
*/
