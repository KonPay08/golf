import { useMemo, useRef, type ReactNode } from "react";
import { motion } from "motion/react";

export type Align = "left" | "right" | "center";

export type Column<Row> = {
  id: string;
  header: string;
  grow?: number;
  align?: Align;
  numeric?: boolean;
  cell: (row: Row, rowIndex: number) => ReactNode;
};

export type ScoreRow = { hole: number; par: number; score?: number };

type BaseRow = Record<string, unknown>;

export type ScoreTableProps<Row extends BaseRow> = {
  rows: Row[];
  columns: Column<Row>[];
  focusedIndex?: number;
  onFocusChange?: (index: number) => void;
  className?: string;
  getRowRef?: (index: number, element: HTMLButtonElement | null) => void;
  getHeaderRef?: (element: HTMLDivElement | null) => void;
};

export default function ScoreTable<Row extends BaseRow>({
  rows,
  columns,
  focusedIndex = -1,
  onFocusChange,
  className,
  getRowRef,
  getHeaderRef,
}: ScoreTableProps<Row>) {
  const ref = useRef<HTMLDivElement>(null);

  const gridTemplate = useMemo(
    () => columns.map(c => `${(c.grow ?? 1)}fr`).join(" "),
    [columns]
  );

  return (
    <div
      ref={ref}
      className={[
        "w-full border border-border bg-bg shadow-sm overflow-hidden",
        className ?? "",
      ].join(" ")}
    >
      {/* ヘッダー */}
      <div
        ref={getHeaderRef}
        className="px-3 py-2 bg-white/5 border-b border-border"
      >
        <div
          className="grid items-center gap-2"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          {columns.map(col => (
            <div
              key={col.id}
              className={[
                "w-full min-w-0 overflow-hidden truncate text-sm text-fg/70 whitespace-nowrap",
                col.align === "right"
                  ? "text-right"
                  : col.align === "center"
                  ? "text-center"
                  : "text-left",
              ].join(" ")}
              title={String(col.header)}
            >
              {col.header}
            </div>
          ))}
        </div>
      </div>

      {/* 本文 */}
      <div className="divide-y divide-border/70">
        {rows.map((row, i) => {
          const isFocused = i === focusedIndex;
          return (
            <button
              key={i}
              type="button"
              ref={(el) => getRowRef?.(i, el)}
              onClick={() => onFocusChange?.(i)}
              className="relative w-full px-3 py-3 text-left outline-none"
              style={{ scrollMarginTop: "16px", scrollMarginBottom: "16px" }}
            >
              {/* 左端バー */}
              <motion.span
                className="absolute left-0 top-0 h-full w-[2px] bg-brand origin-top"
                animate={{ scaleY: isFocused ? 1 : 0 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
              />
              {/* 行ハイライト */}
              <motion.span
                className="pointer-events-none absolute inset-0 bg-brand/10"
                animate={{ opacity: isFocused ? 1 : 0 }}
                transition={{ duration: 0.14 }}
              />

              <div
                className="relative grid items-center gap-2"
                style={{ gridTemplateColumns: gridTemplate }}
              >
                {columns.map(col => {
                  const raw = col.cell(row, i);
                  const align =
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                      ? "text-center"
                      : "text-left";
                  const num = col.numeric ? "num-tabular" : "";
                  const isPending = isFocused && (raw === "−" || raw == null);

                  return (
                    <div key={col.id} className={`w-full min-w-0 overflow-hidden truncate text-lg ${align} ${num}`}>
                      {isPending ? (
                        <motion.span
                          initial={{ opacity: 1 }}
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="text-muted"
                        >
                          {raw ?? "−"}
                        </motion.span>
                      ) : (
                        <span className={raw === "−" ? "text-muted" : ""}>
                          {raw ?? "−"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
