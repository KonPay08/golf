import { motion, useReducedMotion } from "motion/react";

export type HalfTab = "OUT" | "IN";

export type SwitchTabsProps = {
  value: HalfTab;
  onChange: (next: HalfTab) => void;
  className?: string;
  /** アニメ時間(ms). 既定: 180 */
  durationMs?: number;
  /** ラベル置換（多言語対応用） */
  labels?: Record<HalfTab, string>;
};

export default function SwitchTabs({
  value,
  onChange,
  className,
  durationMs = 180,
  labels = { OUT: "OUT", IN: "IN" },
}: SwitchTabsProps) {
  const tabs: HalfTab[] = ["OUT", "IN"];
  const reduced = useReducedMotion();

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = tabs.indexOf(value);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      onChange(tabs[(idx + 1) % tabs.length]);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      onChange(tabs[(idx - 1 + tabs.length) % tabs.length]);
    } else if (e.key === "Home") {
      e.preventDefault();
      onChange(tabs[0]);
    } else if (e.key === "End") {
      e.preventDefault();
      onChange(tabs[tabs.length - 1]);
    }
  };

  const duration = (reduced ? 120 : durationMs) / 1000;

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="Score halves"
        onKeyDown={onKeyDown}
        className="relative inline-flex items-center gap-1 rounded-full border border-border bg-bg p-1 w-full"
      >
        {tabs.map((k) => {
          const selected = value === k;
          return (
            <button
              key={k}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`panel-${k}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(k)}
              className={[
                "relative px-4 py-1.5 text-base font-medium rounded-full focus:outline-none w-full",
                "focus-visible:ring-2 focus-visible:ring-brand",
                selected
                  ? "text-brand-fg"
                  : "text-fg/70 hover:bg-black/5 dark:hover:bg-white/10",
              ].join(" ")}
            >
              {selected && (
                <motion.span
                  layoutId="switch-tab-indicator"
                  className="absolute inset-0 rounded-full bg-brand"
                  transition={{ type: "tween", ease: [0.2, 0, 0, 1], duration }}
                />
              )}
              <span className="relative z-10">{labels[k]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
